-- Create match_events table for tracking goals, cards, subs, etc.
CREATE TABLE public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'injury', 'penalty', 'halftime', 'fulltime')),
  team_id UUID REFERENCES public.teams(id),
  player_id UUID REFERENCES public.players(id),
  minute INTEGER NOT NULL,
  details JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create match_reports table for post-match reports
CREATE TABLE public.match_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referee_id UUID REFERENCES auth.users(id) NOT NULL,
  attendance INTEGER,
  weather TEXT CHECK (weather IN ('sunny', 'cloudy', 'rainy', 'windy')),
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create match_lineups table for team lineups
CREATE TABLE public.match_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  goalkeeper_id UUID REFERENCES public.players(id),
  player_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(match_id, team_id)
);

-- Enable RLS
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;

-- RLS for match_events: Referees can manage events for their matches, everyone can view
CREATE POLICY "Anyone can view match events"
ON public.match_events FOR SELECT
USING (true);

CREATE POLICY "Referees can insert events for their matches"
ON public.match_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = match_id 
    AND matches.referee_id = auth.uid()
  )
);

CREATE POLICY "Referees can update events for their matches"
ON public.match_events FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = match_id 
    AND matches.referee_id = auth.uid()
  )
);

CREATE POLICY "Referees can delete events for their matches"
ON public.match_events FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = match_id 
    AND matches.referee_id = auth.uid()
  )
);

-- RLS for match_reports: Referees can manage their reports, everyone can view
CREATE POLICY "Anyone can view match reports"
ON public.match_reports FOR SELECT
USING (true);

CREATE POLICY "Referees can insert their own reports"
ON public.match_reports FOR INSERT
WITH CHECK (referee_id = auth.uid());

CREATE POLICY "Referees can update their own reports"
ON public.match_reports FOR UPDATE
USING (referee_id = auth.uid());

-- RLS for match_lineups: Referees can manage lineups, everyone can view
CREATE POLICY "Anyone can view match lineups"
ON public.match_lineups FOR SELECT
USING (true);

CREATE POLICY "Referees can insert lineups for their matches"
ON public.match_lineups FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = match_id 
    AND matches.referee_id = auth.uid()
  )
);

CREATE POLICY "Referees can update lineups for their matches"
ON public.match_lineups FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = match_id 
    AND matches.referee_id = auth.uid()
  )
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;