-- Allow super admins and tournament admins to list referee accounts for match assignment
-- without exposing direct auth.users or unrestricted user_roles reads.
CREATE OR REPLACE FUNCTION public.get_referees_with_email()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role text,
  email text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'tho_admin'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Only admins and tournament admins can view referee accounts';
  END IF;

  RETURN QUERY
  SELECT
    ur.id,
    ur.user_id,
    ur.role::text,
    au.email::text,
    ur.created_at
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'referee'::public.app_role
  ORDER BY au.email;
END;
$$;

REVOKE ALL ON FUNCTION public.get_referees_with_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_referees_with_email() TO authenticated;
