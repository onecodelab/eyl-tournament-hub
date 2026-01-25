-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

-- Create new policies that allow both admin and tho_admin roles
CREATE POLICY "Admins and THO admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' 
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'tho_admin'::app_role)
  )
);

CREATE POLICY "Admins and THO admins can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-images' 
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'tho_admin'::app_role)
  )
);

CREATE POLICY "Admins and THO admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-images' 
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'tho_admin'::app_role)
  )
);