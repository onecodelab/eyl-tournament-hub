-- Add winner_team_id column to tournaments table
ALTER TABLE public.tournaments
ADD COLUMN winner_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create index for winner lookups
CREATE INDEX idx_tournaments_winner ON public.tournaments(winner_team_id);

-- Comment on column
COMMENT ON COLUMN public.tournaments.winner_team_id IS 'The winning team of the tournament, auto-set from knockout final match result';