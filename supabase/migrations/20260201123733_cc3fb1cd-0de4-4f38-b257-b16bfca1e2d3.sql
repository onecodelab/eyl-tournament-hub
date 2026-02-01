-- Phase 1: Database functions to calculate player stats from match data

-- Function to get player goal count from completed match events
CREATE OR REPLACE FUNCTION get_player_goal_count(p_player_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*), 0)::INTEGER
  FROM match_events me
  JOIN matches m ON m.id = me.match_id
  WHERE me.player_id = p_player_id
    AND me.event_type = 'goal'
    AND m.status = 'completed'
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Function to get player assist count from completed match events
CREATE OR REPLACE FUNCTION get_player_assist_count(p_player_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*), 0)::INTEGER
  FROM match_events me
  JOIN matches m ON m.id = me.match_id
  WHERE me.player_id = p_player_id
    AND me.event_type = 'assist'
    AND m.status = 'completed'
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Function to get player appearances from completed match lineups
CREATE OR REPLACE FUNCTION get_player_appearances(p_player_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(DISTINCT ml.match_id), 0)::INTEGER
  FROM match_lineups ml
  JOIN matches m ON m.id = ml.match_id
  WHERE m.status = 'completed'
    AND (
      ml.goalkeeper_id = p_player_id
      OR p_player_id = ANY(ml.player_ids)
    )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Function to get all player stats at once (more efficient for single player lookups)
CREATE OR REPLACE FUNCTION get_player_stats(p_player_id UUID)
RETURNS TABLE (goals INTEGER, assists INTEGER, appearances INTEGER) AS $$
  SELECT 
    get_player_goal_count(p_player_id) as goals,
    get_player_assist_count(p_player_id) as assists,
    get_player_appearances(p_player_id) as appearances
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Trigger function to sync player stats when a match is completed
CREATE OR REPLACE FUNCTION sync_player_stats_on_match_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when match status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Update goals for all players with goal events in this match
    UPDATE players p
    SET goals = get_player_goal_count(p.id)
    WHERE p.id IN (
      SELECT DISTINCT player_id FROM match_events 
      WHERE match_id = NEW.id AND player_id IS NOT NULL
    );
    
    -- Update assists for all players with assist events in this match
    UPDATE players p
    SET assists = get_player_assist_count(p.id)
    WHERE p.id IN (
      SELECT DISTINCT player_id FROM match_events 
      WHERE match_id = NEW.id AND player_id IS NOT NULL
    );
    
    -- Update appearances for all players in this match's lineups
    UPDATE players p
    SET appearances = get_player_appearances(p.id)
    WHERE p.id IN (
      SELECT DISTINCT goalkeeper_id FROM match_lineups WHERE match_id = NEW.id AND goalkeeper_id IS NOT NULL
      UNION
      SELECT DISTINCT unnest(player_ids) FROM match_lineups WHERE match_id = NEW.id
    );
    
    -- Update team standings
    -- Get goals for and against for each team from completed matches
    UPDATE teams t
    SET 
      wins = (
        SELECT COUNT(*) FROM matches m 
        WHERE m.status = 'completed' 
        AND m.tournament_id = t.tournament_id
        AND (
          (m.home_team_id = t.id AND m.home_score > m.away_score)
          OR (m.away_team_id = t.id AND m.away_score > m.home_score)
        )
      ),
      draws = (
        SELECT COUNT(*) FROM matches m 
        WHERE m.status = 'completed' 
        AND m.tournament_id = t.tournament_id
        AND (m.home_team_id = t.id OR m.away_team_id = t.id)
        AND m.home_score = m.away_score
      ),
      losses = (
        SELECT COUNT(*) FROM matches m 
        WHERE m.status = 'completed' 
        AND m.tournament_id = t.tournament_id
        AND (
          (m.home_team_id = t.id AND m.home_score < m.away_score)
          OR (m.away_team_id = t.id AND m.away_score < m.home_score)
        )
      ),
      goals_for = (
        SELECT COALESCE(SUM(
          CASE 
            WHEN m.home_team_id = t.id THEN m.home_score
            WHEN m.away_team_id = t.id THEN m.away_score
            ELSE 0
          END
        ), 0) FROM matches m 
        WHERE m.status = 'completed' 
        AND m.tournament_id = t.tournament_id
        AND (m.home_team_id = t.id OR m.away_team_id = t.id)
      ),
      goals_against = (
        SELECT COALESCE(SUM(
          CASE 
            WHEN m.home_team_id = t.id THEN m.away_score
            WHEN m.away_team_id = t.id THEN m.home_score
            ELSE 0
          END
        ), 0) FROM matches m 
        WHERE m.status = 'completed' 
        AND m.tournament_id = t.tournament_id
        AND (m.home_team_id = t.id OR m.away_team_id = t.id)
      )
    WHERE t.id IN (NEW.home_team_id, NEW.away_team_id);
    
    -- Calculate points (3 for win, 1 for draw)
    UPDATE teams t
    SET points = (COALESCE(t.wins, 0) * 3) + COALESCE(t.draws, 0)
    WHERE t.id IN (NEW.home_team_id, NEW.away_team_id);
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_stats_on_match_complete ON matches;
CREATE TRIGGER sync_stats_on_match_complete
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION sync_player_stats_on_match_complete();

-- Reset all player stats to 0 (as requested)
UPDATE players SET goals = 0, assists = 0, appearances = 0;

-- Reset all team stats to 0
UPDATE teams SET wins = 0, draws = 0, losses = 0, goals_for = 0, goals_against = 0, points = 0;

-- Delete all matches that are "completed" but have no match report (legacy data)
DELETE FROM matches 
WHERE status = 'completed' 
AND id NOT IN (SELECT match_id FROM match_reports);