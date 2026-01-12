-- Fix STORAGE_EXPOSURE: Restrict storage write operations to admins only
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Create admin-only write policies for hero-images bucket
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'hero-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'hero-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'hero-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Fix PUBLIC_DATA_EXPOSURE: Restrict user_roles visibility
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;

-- Allow authenticated users to view only their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view all roles (for admin panel)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));