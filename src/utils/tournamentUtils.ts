// Tournament utility functions for calculating standings, qualifications, and bracket seeding

export interface TeamStanding {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  group_name: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  qualified: boolean;
  position: number;
}

export interface Match {
  id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  stage: string | null;
  tagline?: string | null;
  match_date: string | null;
  venue: string | null;
}

export interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  group_name: string | null;
  points?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goals_for?: number | null;
  goals_against?: number | null;
}

// Points system constants
const POINTS_WIN = 3;
const POINTS_DRAW = 1;
const POINTS_LOSS = 0;

/**
 * Calculate team standings from match results
 * Uses the standard points system: 3 for win, 1 for draw, 0 for loss
 */
export function calculateStandingsFromMatches(
  teams: Team[],
  matches: Match[],
  teamsQualifyingPerGroup: number = 2
): Map<string, TeamStanding[]> {
  // Initialize standings map with team IDs
  const standingsMap = new Map<string, TeamStanding>();
  
  teams.forEach(team => {
    standingsMap.set(team.id, {
      id: team.id,
      name: team.name,
      short_name: team.short_name,
      logo_url: team.logo_url,
      group_name: team.group_name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      qualified: false,
      position: 0
    });
  });

  // Process completed group stage matches
  const groupMatches = matches.filter(m => 
    m.status === 'completed' && 
    (m.stage === 'group' || !m.stage) &&
    m.home_score !== null && 
    m.away_score !== null
  );

  groupMatches.forEach(match => {
    const homeStanding = standingsMap.get(match.home_team_id || '');
    const awayStanding = standingsMap.get(match.away_team_id || '');
    
    if (!homeStanding || !awayStanding) return;

    const homeScore = match.home_score!;
    const awayScore = match.away_score!;

    // Update played
    homeStanding.played++;
    awayStanding.played++;

    // Update goals
    homeStanding.goals_for += homeScore;
    homeStanding.goals_against += awayScore;
    awayStanding.goals_for += awayScore;
    awayStanding.goals_against += homeScore;

    // Determine result and update points
    if (homeScore > awayScore) {
      // Home win
      homeStanding.wins++;
      homeStanding.points += POINTS_WIN;
      awayStanding.losses++;
      awayStanding.points += POINTS_LOSS;
    } else if (awayScore > homeScore) {
      // Away win
      awayStanding.wins++;
      awayStanding.points += POINTS_WIN;
      homeStanding.losses++;
      homeStanding.points += POINTS_LOSS;
    } else {
      // Draw
      homeStanding.draws++;
      homeStanding.points += POINTS_DRAW;
      awayStanding.draws++;
      awayStanding.points += POINTS_DRAW;
    }

    // Update goal difference
    homeStanding.goal_difference = homeStanding.goals_for - homeStanding.goals_against;
    awayStanding.goal_difference = awayStanding.goals_for - awayStanding.goals_against;
  });

  // Group teams by their group_name
  const groupedTeams = new Map<string, TeamStanding[]>();
  
  standingsMap.forEach(standing => {
    const groupName = standing.group_name || 'No Group';
    if (!groupedTeams.has(groupName)) {
      groupedTeams.set(groupName, []);
    }
    groupedTeams.get(groupName)!.push(standing);
  });

  // Sort each group and determine qualifications
  const sortedGroups = new Map<string, TeamStanding[]>();
  
  groupedTeams.forEach((groupTeams, groupName) => {
    // Sort by: 1) Points, 2) Goal Difference, 3) Goals Scored, 4) Name (alphabetically)
    const sorted = [...groupTeams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      return a.name.localeCompare(b.name);
    });

    // Assign positions and qualification status
    sorted.forEach((team, index) => {
      team.position = index + 1;
      team.qualified = index < teamsQualifyingPerGroup;
    });

    sortedGroups.set(groupName, sorted);
  });

  return sortedGroups;
}

/**
 * Get qualified teams from group stage sorted by their group and position
 */
export function getQualifiedTeams(
  groupStandings: Map<string, TeamStanding[]>,
  teamsQualifyingPerGroup: number = 2
): TeamStanding[] {
  const qualified: TeamStanding[] = [];
  
  // Sort groups alphabetically to ensure consistent ordering
  const sortedGroupNames = Array.from(groupStandings.keys()).sort();
  
  sortedGroupNames.forEach(groupName => {
    const groupTeams = groupStandings.get(groupName) || [];
    groupTeams.slice(0, teamsQualifyingPerGroup).forEach(team => {
      qualified.push(team);
    });
  });

  return qualified;
}

/**
 * Generate knockout bracket pairings based on group positions
 * Standard format: 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C, etc.
 */
export function generateKnockoutPairings(
  groupStandings: Map<string, TeamStanding[]>,
  teamsQualifyingPerGroup: number = 2
): { home: TeamStanding | null; away: TeamStanding | null; stage: string }[] {
  const groups = Array.from(groupStandings.keys()).sort();
  const numGroups = groups.length;
  const qualifiedTeams = getQualifiedTeams(groupStandings, teamsQualifyingPerGroup);
  
  const pairings: { home: TeamStanding | null; away: TeamStanding | null; stage: string }[] = [];

  // Determine the stage based on number of qualified teams
  const numQualified = qualifiedTeams.length;
  let stage = 'round_of_16';
  if (numQualified <= 2) stage = 'final';
  else if (numQualified <= 4) stage = 'semi_final';
  else if (numQualified <= 8) stage = 'quarter_final';

  // Standard FIFA-style pairing: 1A vs 2B, 1C vs 2D, etc.
  // For 2 groups: 1A vs 2B, 1B vs 2A
  // For 4 groups: 1A vs 2B, 1C vs 2D, 1B vs 2A, 1D vs 2C
  if (numGroups >= 2) {
    for (let i = 0; i < numGroups; i += 2) {
      const groupA = groups[i];
      const groupB = groups[i + 1];
      
      const standingsA = groupStandings.get(groupA) || [];
      const standingsB = groupStandings.get(groupB) || [];
      
      const first_A = standingsA[0] || null;
      const second_A = standingsA[1] || null;
      const first_B = standingsB?.[0] || null;
      const second_B = standingsB?.[1] || null;

      // 1A vs 2B
      if (first_A || second_B) {
        pairings.push({ home: first_A, away: second_B, stage });
      }
      // 1B vs 2A
      if (first_B || second_A) {
        pairings.push({ home: first_B, away: second_A, stage });
      }
    }
  } else if (numGroups === 1) {
    // Single group - top 2 go to final
    const standings = groupStandings.get(groups[0]) || [];
    if (standings.length >= 2) {
      pairings.push({ 
        home: standings[0], 
        away: standings[1], 
        stage: 'final' 
      });
    }
  }

  return pairings;
}

/**
 * Organize knockout matches by stage with proper round names
 */
export function organizeKnockoutMatches(
  matches: Match[],
  teamsMap: Map<string, Team>
): { name: string; matches: Match[] }[] {
  const stageOrder = ['round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final'];
  const stageNames: Record<string, string> = {
    'round_of_16': 'Round of 16',
    'quarter_final': 'Quarter-Finals',
    'semi_final': 'Semi-Finals',
    'third_place': 'Third Place',
    'final': 'Final'
  };

  // Filter to only knockout matches
  const knockoutMatches = matches.filter(m => 
    m.stage && m.stage !== 'group'
  );

  const rounds: { name: string; matches: Match[] }[] = [];

  stageOrder.forEach(stage => {
    const stageMatches = knockoutMatches.filter(m => m.stage === stage);
    if (stageMatches.length > 0) {
      rounds.push({
        name: stageNames[stage] || stage,
        matches: stageMatches
      });
    }
  });

  // Reverse order for bracket display (Final first, then semi, etc.)
  return rounds.reverse();
}

/**
 * Check if a team has already mathematically qualified
 * based on remaining matches and points
 */
export function checkMathematicalQualification(
  team: TeamStanding,
  groupTeams: TeamStanding[],
  remainingMatchesPerTeam: number,
  teamsQualifyingPerGroup: number
): boolean {
  const maxPointsForOthers = groupTeams
    .filter(t => t.id !== team.id)
    .map(t => t.points + (remainingMatchesPerTeam * POINTS_WIN));
  
  const teamPoints = team.points;
  
  // Count how many teams could potentially overtake this team
  const teamsThatCouldOvertake = maxPointsForOthers.filter(
    maxPoints => maxPoints > teamPoints
  ).length;

  // Team qualifies if the number of teams that could overtake is less than
  // the number of teams minus qualifying positions
  return teamsThatCouldOvertake < (groupTeams.length - teamsQualifyingPerGroup);
}

/**
 * Get display text for knockout bracket TBD slots
 */
export function getKnockoutSlotLabel(
  groupName: string | null,
  position: number
): string {
  if (!groupName) return 'TBD';
  
  const positionSuffix = position === 1 ? '1st' : position === 2 ? '2nd' : `${position}th`;
  return `${positionSuffix} ${groupName}`;
}
