-- Fix the UPDATE policy on matches to include explicit WITH CHECK
DROP POLICY IF EXISTS "Admins can update matches" ON public.matches;

CREATE POLICY "Admins and referees can update matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (has_role(auth.uid(), 'tho_admin'::app_role) AND is_tournament_admin(auth.uid(), tournament_id))
  OR (referee_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (has_role(auth.uid(), 'tho_admin'::app_role) AND is_tournament_admin(auth.uid(), tournament_id))
  OR (referee_id = auth.uid())
);