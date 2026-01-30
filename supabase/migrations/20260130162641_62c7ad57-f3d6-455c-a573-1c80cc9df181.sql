-- Add match officials columns to match_reports table
ALTER TABLE public.match_reports
ADD COLUMN IF NOT EXISTS centre_referee text,
ADD COLUMN IF NOT EXISTS assistant_referee_1 text,
ADD COLUMN IF NOT EXISTS assistant_referee_2 text,
ADD COLUMN IF NOT EXISTS fourth_official text,
ADD COLUMN IF NOT EXISTS match_commissioner text,
ADD COLUMN IF NOT EXISTS home_coach text,
ADD COLUMN IF NOT EXISTS away_coach text,
ADD COLUMN IF NOT EXISTS half_time_home integer,
ADD COLUMN IF NOT EXISTS half_time_away integer;