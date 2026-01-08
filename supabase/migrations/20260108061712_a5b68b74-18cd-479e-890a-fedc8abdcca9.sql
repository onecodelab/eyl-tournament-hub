-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  coach TEXT,
  stadium TEXT,
  founded_year INTEGER,
  logo_url TEXT,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  jersey_number INTEGER,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  appearances INTEGER DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'postponed')),
  tagline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'General',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can view news" ON public.news FOR SELECT USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample tournaments
INSERT INTO public.tournaments (name, description, start_date, end_date, status, logo_url)
VALUES 
  ('U-17 Addis Premier', 'Premier youth league in Addis', '2026-01-01', '2026-06-30', 'ongoing', 'https://via.placeholder.com/50'),
  ('Regional Talent Cup', 'Regional competition', '2026-02-01', '2026-05-31', 'ongoing', 'https://via.placeholder.com/50'),
  ('EYL Championship Series', 'National championship', '2026-03-01', '2026-08-31', 'upcoming', 'https://via.placeholder.com/50'),
  ('Bahir Dar Youth League', 'Bahir Dar regional', '2025-11-01', '2025-12-31', 'completed', 'https://via.placeholder.com/50');

-- Insert sample teams
INSERT INTO public.teams (name, short_name, coach, stadium, founded_year, logo_url, tournament_id, wins, draws, losses, goals_for, goals_against, points)
VALUES 
  ('Arada FC Youth', 'AR', 'Coach Ahmed', 'Jan Meda Stadium', 2020, 'https://via.placeholder.com/50', (SELECT id FROM tournaments WHERE name='U-17 Addis Premier' LIMIT 1), 8, 2, 2, 24, 8, 26),
  ('Jan Meda Stars', 'JM', 'Coach Tariku', 'Jan Meda Stadium', 2019, 'https://via.placeholder.com/50', (SELECT id FROM tournaments WHERE name='U-17 Addis Premier' LIMIT 1), 7, 1, 4, 21, 15, 22),
  ('Ethiopian Coffee FC', 'EC', 'Coach Yohannes', 'Addis Stadium', 2021, 'https://via.placeholder.com/50', (SELECT id FROM tournaments WHERE name='U-17 Addis Premier' LIMIT 1), 6, 3, 3, 19, 12, 21),
  ('Dire Dawa Lions', 'DD', 'Coach Girma', 'Dire Dawa Stadium', 2018, 'https://via.placeholder.com/50', (SELECT id FROM tournaments WHERE name='U-17 Addis Premier' LIMIT 1), 5, 2, 5, 17, 18, 17);

-- Insert sample players
INSERT INTO public.players (name, position, jersey_number, team_id, goals, assists, appearances, photo_url)
VALUES 
  ('Abenezer Tadesse', 'FW', 9, (SELECT id FROM teams WHERE short_name='AR' LIMIT 1), 18, 5, 12, 'https://via.placeholder.com/50'),
  ('Surafel Hailu', 'MF', 8, (SELECT id FROM teams WHERE short_name='JM' LIMIT 1), 15, 7, 12, 'https://via.placeholder.com/50'),
  ('Mulugeta Bekele', 'FW', 10, (SELECT id FROM teams WHERE short_name='EC' LIMIT 1), 14, 3, 11, 'https://via.placeholder.com/50'),
  ('Yohannes Mekonnen', 'MF', 7, (SELECT id FROM teams WHERE short_name='DD' LIMIT 1), 12, 6, 12, 'https://via.placeholder.com/50');

-- Insert sample matches
INSERT INTO public.matches (home_team_id, away_team_id, tournament_id, home_score, away_score, match_date, venue, status, tagline)
VALUES 
  ((SELECT id FROM teams WHERE short_name='AR' LIMIT 1), (SELECT id FROM teams WHERE short_name='JM' LIMIT 1), (SELECT id FROM tournaments WHERE name='U-17 Addis Premier' LIMIT 1), 2, 1, '2026-01-08 15:00:00+00', 'Jan Meda Stadium', 'completed', 'Jan Meda Derby'),
  ((SELECT id FROM teams WHERE short_name='EC' LIMIT 1), (SELECT id FROM teams WHERE short_name='DD' LIMIT 1), (SELECT id FROM tournaments WHERE name='U-17 Addis Premier' LIMIT 1), 1, 1, NOW(), 'Addis Stadium', 'live', 'Capital Clash'),
  ((SELECT id FROM teams WHERE short_name='AR' LIMIT 1), (SELECT id FROM teams WHERE short_name='EC' LIMIT 1), (SELECT id FROM tournaments WHERE name='U-17 Addis Premier' LIMIT 1), NULL, NULL, NOW() + INTERVAL '4 hours', 'Jan Meda Stadium', 'scheduled', 'Eastern Derby');

-- Insert sample news
INSERT INTO public.news (title, excerpt, content, category, image_url, is_featured, published_at)
VALUES 
  ('EYL Academy graduates called up to National Team', 'Three young stars make the jump', 'Mulugeta, Abenezer, and Surafel selected...', 'Breakthrough', 'https://via.placeholder.com/200', true, NOW()),
  ('Arada FC unbeaten in 4', 'Youth side shows championship form', 'Arada continues winning streak...', 'Match Report', 'https://via.placeholder.com/200', false, NOW() - INTERVAL '2 hours'),
  ('New talent discovered in Bahir Dar', 'Scout report highlights prospect', '16-year-old sensation emerges...', 'Scouting', 'https://via.placeholder.com/200', false, NOW() - INTERVAL '4 hours');