-- Create tournament_hubs table
CREATE TABLE IF NOT EXISTS public.tournament_hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add hub_id to tournaments
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS hub_id UUID REFERENCES public.tournament_hubs(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.tournament_hubs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow public read access to tournament_hubs"
ON public.tournament_hubs FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow admins to manage tournament_hubs"
ON public.tournament_hubs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'tho_admin')
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tournament_hubs_updated_at
BEFORE UPDATE ON public.tournament_hubs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
