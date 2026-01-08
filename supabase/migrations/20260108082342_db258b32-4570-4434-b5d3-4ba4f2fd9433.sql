-- Add RLS policies for authenticated users to manage all tables

-- Tournaments: Allow authenticated users to INSERT, UPDATE, DELETE
CREATE POLICY "Authenticated users can insert tournaments"
ON public.tournaments
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tournaments"
ON public.tournaments
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tournaments"
ON public.tournaments
FOR DELETE
TO authenticated
USING (true);

-- Teams: Allow authenticated users to INSERT, UPDATE, DELETE
CREATE POLICY "Authenticated users can insert teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (true);

-- Players: Allow authenticated users to INSERT, UPDATE, DELETE
CREATE POLICY "Authenticated users can insert players"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update players"
ON public.players
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete players"
ON public.players
FOR DELETE
TO authenticated
USING (true);

-- Matches: Allow authenticated users to INSERT, UPDATE, DELETE
CREATE POLICY "Authenticated users can insert matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete matches"
ON public.matches
FOR DELETE
TO authenticated
USING (true);

-- News: Allow authenticated users to INSERT, UPDATE, DELETE
CREATE POLICY "Authenticated users can insert news"
ON public.news
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update news"
ON public.news
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete news"
ON public.news
FOR DELETE
TO authenticated
USING (true);