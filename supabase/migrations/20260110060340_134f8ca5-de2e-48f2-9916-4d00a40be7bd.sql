-- 5. Create helper function to check if user is tournament admin for a specific tournament
CREATE OR REPLACE FUNCTION public.is_tournament_admin(_user_id UUID, _tournament_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'tho_admin'
  )
  AND EXISTS (
    SELECT 1
    FROM public.tournament_admins ta
    WHERE ta.user_id = _user_id AND ta.tournament_id = _tournament_id
  )
$$;

-- 6. Create helper function to get user's assigned tournaments
CREATE OR REPLACE FUNCTION public.get_user_tournaments(_user_id UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(tournament_id), ARRAY[]::UUID[])
  FROM public.tournament_admins
  WHERE user_id = _user_id
$$;

-- 7. Create helper function to check if user can manage a team (either super admin or THO admin for team's tournament)
CREATE OR REPLACE FUNCTION public.can_manage_team(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.teams t
      JOIN public.tournament_admins ta ON ta.tournament_id = t.tournament_id
      WHERE t.id = _team_id AND ta.user_id = _user_id
      AND public.has_role(_user_id, 'tho_admin'::app_role)
    )
$$;

-- 8. RLS Policies for tournament_admins table
CREATE POLICY "Super admins can view all tournament admins"
ON public.tournament_admins FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR user_id = auth.uid());

CREATE POLICY "Super admins can insert tournament admins"
ON public.tournament_admins FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can update tournament admins"
ON public.tournament_admins FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can delete tournament admins"
ON public.tournament_admins FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 9. Update tournaments RLS - Only super admins can create/update/delete tournaments
DROP POLICY IF EXISTS "Authenticated users can insert tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Authenticated users can update tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Authenticated users can delete tournaments" ON public.tournaments;

CREATE POLICY "Super admins can insert tournaments"
ON public.tournaments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can update tournaments"
ON public.tournaments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can delete tournaments"
ON public.tournaments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 10. Update sponsors RLS - Only super admins can manage sponsors
DROP POLICY IF EXISTS "Authenticated users can insert sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Authenticated users can update sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Authenticated users can delete sponsors" ON public.sponsors;

CREATE POLICY "Super admins can insert sponsors"
ON public.sponsors FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can update sponsors"
ON public.sponsors FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can delete sponsors"
ON public.sponsors FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 11. Update teams RLS - Super admins can manage all, THO admins can manage their tournament's teams
DROP POLICY IF EXISTS "Authenticated users can insert teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can update teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON public.teams;

CREATE POLICY "Admins can insert teams"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

CREATE POLICY "Admins can update teams"
ON public.teams FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

CREATE POLICY "Admins can delete teams"
ON public.teams FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

-- 12. Update players RLS - Super admins can manage all, THO admins can manage players in their tournament's teams
DROP POLICY IF EXISTS "Authenticated users can insert players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can update players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can delete players" ON public.players;

CREATE POLICY "Admins can insert players"
ON public.players FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.can_manage_team(auth.uid(), team_id)
);

CREATE POLICY "Admins can update players"
ON public.players FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.can_manage_team(auth.uid(), team_id)
);

CREATE POLICY "Admins can delete players"
ON public.players FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.can_manage_team(auth.uid(), team_id)
);

-- 13. Update matches RLS - Super admins can manage all, THO admins can manage their tournament's matches
DROP POLICY IF EXISTS "Authenticated users can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON public.matches;

CREATE POLICY "Admins can insert matches"
ON public.matches FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

CREATE POLICY "Admins can update matches"
ON public.matches FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
  OR referee_id = auth.uid()
);

CREATE POLICY "Admins can delete matches"
ON public.matches FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

-- 14. Update news RLS - Super admins can manage all, THO admins can manage their tournament's news
DROP POLICY IF EXISTS "Authenticated users can insert news" ON public.news;
DROP POLICY IF EXISTS "Authenticated users can update news" ON public.news;
DROP POLICY IF EXISTS "Authenticated users can delete news" ON public.news;

CREATE POLICY "Admins can insert news"
ON public.news FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND tournament_id IS NOT NULL
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

CREATE POLICY "Admins can update news"
ON public.news FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND tournament_id IS NOT NULL
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

CREATE POLICY "Admins can delete news"
ON public.news FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND tournament_id IS NOT NULL
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

-- 15. Update videos RLS - Super admins can manage all, THO admins can manage their tournament's videos
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON public.videos;

CREATE POLICY "Admins can insert videos"
ON public.videos FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND tournament_id IS NOT NULL
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

CREATE POLICY "Admins can update videos"
ON public.videos FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND tournament_id IS NOT NULL
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);

CREATE POLICY "Admins can delete videos"
ON public.videos FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'tho_admin'::app_role)
    AND tournament_id IS NOT NULL
    AND public.is_tournament_admin(auth.uid(), tournament_id)
  )
);