-- Create sponsors table for managing partner logos and links
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  type TEXT DEFAULT 'partner',
  position TEXT DEFAULT 'top',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view sponsors" 
ON public.sponsors 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert sponsors" 
ON public.sponsors 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sponsors" 
ON public.sponsors 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sponsors" 
ON public.sponsors 
FOR DELETE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_sponsors_updated_at
BEFORE UPDATE ON public.sponsors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sponsors
INSERT INTO public.sponsors (name, type, position, display_order) VALUES
('Ethio Telecom', 'Lead Partner', 'both', 1),
('Dashen Bank', 'Official Bank', 'both', 2),
('Ethiopian Airlines', 'Official Carrier', 'both', 3),
('Abyssinia Bank', 'Official Partner', 'both', 4),
('Gomeju Oil', 'Official Sponsor', 'both', 5),
('Awash Bank', 'Official Partner', 'both', 6);