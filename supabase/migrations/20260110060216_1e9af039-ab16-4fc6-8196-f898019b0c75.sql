-- 1. Add tho_admin to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tho_admin';

-- 2. Create tournament_admins junction table
CREATE TABLE public.tournament_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tournament_id)
);

-- Enable RLS on tournament_admins
ALTER TABLE public.tournament_admins ENABLE ROW LEVEL SECURITY;

-- 3. Add tournament_id to news table for tournament-specific news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL;

-- 4. Add tournament_id to videos table for tournament-specific videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL;