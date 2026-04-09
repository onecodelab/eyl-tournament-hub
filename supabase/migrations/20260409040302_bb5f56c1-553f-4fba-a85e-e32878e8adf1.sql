ALTER TABLE public.match_events DROP CONSTRAINT IF EXISTS match_events_event_type_check;

ALTER TABLE public.match_events
ADD CONSTRAINT match_events_event_type_check
CHECK (
  event_type = ANY (
    ARRAY[
      'goal'::text,
      'yellow_card'::text,
      'red_card'::text,
      'substitution'::text,
      'injury'::text,
      'penalty'::text,
      'halftime'::text,
      'fulltime'::text,
      'penalty_shootout'::text
    ]
  )
);