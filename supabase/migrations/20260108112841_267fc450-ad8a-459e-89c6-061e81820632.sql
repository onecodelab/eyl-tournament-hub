-- Create videos table for YouTube video links
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policies for videos
CREATE POLICY "Anyone can view videos" 
ON public.videos 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos" 
ON public.videos 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete videos" 
ON public.videos 
FOR DELETE 
USING (true);