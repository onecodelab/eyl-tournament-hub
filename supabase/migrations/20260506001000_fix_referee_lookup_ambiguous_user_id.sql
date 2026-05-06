-- Fix the referee lookup RPC for PL/pgSQL name resolution.
-- The function returns a column named user_id, so every table reference to user_id
-- must be qualified with a table alias to avoid "column reference \"user_id\" is ambiguous".
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
  -- Security check: only super admins and THO/tournament admins may list referee accounts.
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles AS caller_role
    WHERE caller_role.user_id = auth.uid()
      AND caller_role.role IN ('admin'::public.app_role, 'tho_admin'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Only admins and tournament admins can view referee accounts';
  END IF;

  RETURN QUERY
  SELECT
    referee_role.id,
    referee_role.user_id,
    referee_role.role::text,
    auth_user.email::text,
    referee_role.created_at
  FROM public.user_roles AS referee_role
  JOIN auth.users AS auth_user ON auth_user.id = referee_role.user_id
  WHERE referee_role.role = 'referee'::public.app_role
  ORDER BY auth_user.email;
END;
$$;

REVOKE ALL ON FUNCTION public.get_referees_with_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_referees_with_email() TO authenticated;
