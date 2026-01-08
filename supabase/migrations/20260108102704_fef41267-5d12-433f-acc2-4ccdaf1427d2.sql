-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'hero-images');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hero-images');