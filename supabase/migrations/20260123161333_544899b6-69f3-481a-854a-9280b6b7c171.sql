-- Create a function to get user email by user_id (for admin use)
-- This is a security definer function that allows fetching email from auth.users
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text
  FROM auth.users
  WHERE id = _user_id
$$;

-- Create a function to get all referees with their emails (admin only)
CREATE OR REPLACE FUNCTION public.get_referees_with_email()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role text,
  email text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ur.id,
    ur.user_id,
    ur.role::text,
    au.email::text,
    ur.created_at
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'referee'
  ORDER BY au.email
$$;