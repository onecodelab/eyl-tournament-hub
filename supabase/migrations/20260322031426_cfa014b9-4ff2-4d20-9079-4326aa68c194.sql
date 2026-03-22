
CREATE TABLE public.tournament_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament sponsors"
  ON public.tournament_sponsors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert tournament sponsors"
  ON public.tournament_sponsors FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR (has_role(auth.uid(), 'tho_admin'::app_role) AND is_tournament_admin(auth.uid(), tournament_id))
  );

CREATE POLICY "Admins can update tournament sponsors"
  ON public.tournament_sponsors FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (has_role(auth.uid(), 'tho_admin'::app_role) AND is_tournament_admin(auth.uid(), tournament_id))
  );

CREATE POLICY "Admins can delete tournament sponsors"
  ON public.tournament_sponsors FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (has_role(auth.uid(), 'tho_admin'::app_role) AND is_tournament_admin(auth.uid(), tournament_id))
  );
