-- Add tournament configuration columns
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS age_category TEXT CHECK (age_category IN ('u-13', 'u-14', 'u-15', 'u-16', 'u-17', 'u-18', 'u-19', 'u-20')),
  ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'league' CHECK (format IN ('league', 'knockout', 'group_knockout')),
  ADD COLUMN IF NOT EXISTS max_teams INTEGER DEFAULT 16,
  ADD COLUMN IF NOT EXISTS match_duration_minutes INTEGER DEFAULT 90,
  ADD COLUMN IF NOT EXISTS half_time_duration_minutes INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS max_substitutions INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS extra_time_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS penalty_shootout BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.tournaments.age_category IS 'Age group for the tournament (u-13 through u-20)';
COMMENT ON COLUMN public.tournaments.format IS 'Tournament format: league (round-robin), knockout (elimination), or group_knockout (groups then knockout)';
COMMENT ON COLUMN public.tournaments.max_teams IS 'Maximum number of teams allowed in the tournament';
COMMENT ON COLUMN public.tournaments.match_duration_minutes IS 'Total match duration in minutes';
COMMENT ON COLUMN public.tournaments.half_time_duration_minutes IS 'Half-time break duration in minutes';
COMMENT ON COLUMN public.tournaments.max_substitutions IS 'Maximum substitutions allowed per team per match';
COMMENT ON COLUMN public.tournaments.extra_time_duration_minutes IS 'Extra time duration for knockout matches';
COMMENT ON COLUMN public.tournaments.penalty_shootout IS 'Whether penalty shootouts are enabled for draws in knockout matches';