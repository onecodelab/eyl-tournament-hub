-- Add new columns to tournaments table for group+knockout format
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS num_groups integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS teams_per_group integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS teams_qualifying_per_group integer DEFAULT 2;

-- Add group_name column to teams table for group assignment
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS group_name text;

-- Add fayda_number column to players table
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS fayda_number text;

-- Add stage column to matches table for match stage (group, knockout, quarter, semi, final)
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS stage text DEFAULT 'group',
ADD COLUMN IF NOT EXISTS extra_time_option text DEFAULT 'extra_time';

-- Add constraint for stage values
ALTER TABLE public.matches
ADD CONSTRAINT matches_stage_check 
CHECK (stage IN ('group', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final'));

-- Add constraint for extra_time_option values
ALTER TABLE public.matches
ADD CONSTRAINT matches_extra_time_option_check 
CHECK (extra_time_option IN ('extra_time', 'direct_penalty', 'golden_goal'));