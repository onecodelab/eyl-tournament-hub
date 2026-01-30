import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MatchEvent {
  id: string;
  match_id: string;
  event_type: string;
  team_id: string | null;
  player_id: string | null;
  minute: number;
  details: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface MatchLineup {
  id: string;
  match_id: string;
  team_id: string;
  goalkeeper_id: string | null;
  player_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface MatchReport {
  id: string;
  match_id: string;
  referee_id: string;
  attendance: number | null;
  weather: string | null;
  notes: string | null;
  submitted_at: string;
  created_at: string;
  // Match officials
  centre_referee: string | null;
  assistant_referee_1: string | null;
  assistant_referee_2: string | null;
  fourth_official: string | null;
  match_commissioner: string | null;
  home_coach: string | null;
  away_coach: string | null;
  half_time_home: number | null;
  half_time_away: number | null;
}

export function useRefereeMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referee-matches", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url, coach),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url, coach),
          tournament:tournaments(id, name)
        `)
        .eq("referee_id", user.id)
        .order("match_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useMatchById(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url, coach),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url, coach),
          tournament:tournaments(id, name)
        `)
        .eq("id", matchId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!matchId,
  });
}

export function useMatchEvents(matchId: string) {
  return useQuery({
    queryKey: ["match-events", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_events")
        .select(`
          *,
          team:teams(id, name, short_name),
          player:players(id, name, jersey_number)
        `)
        .eq("match_id", matchId)
        .order("minute", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!matchId,
  });
}

export function useMatchLineups(matchId: string) {
  return useQuery({
    queryKey: ["match-lineups", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_lineups")
        .select("*")
        .eq("match_id", matchId);
      
      if (error) throw error;
      return data as MatchLineup[];
    },
    enabled: !!matchId,
  });
}

export function useMatchReport(matchId: string) {
  return useQuery({
    queryKey: ["match-report", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_reports")
        .select("*")
        .eq("match_id", matchId)
        .maybeSingle();
      
      if (error) throw error;
      return data as MatchReport | null;
    },
    enabled: !!matchId,
  });
}

export function useTeamPlayers(teamId: string | undefined) {
  return useQuery({
    queryKey: ["team-players", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", teamId)
        .order("jersey_number", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });
}

export function useAddMatchEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      match_id: string;
      event_type: string;
      team_id?: string;
      player_id?: string;
      minute: number;
      details?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("match_events")
        .insert([{
          match_id: event.match_id,
          event_type: event.event_type,
          team_id: event.team_id,
          player_id: event.player_id,
          minute: event.minute,
          details: event.details as any,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match-events", variables.match_id] });
    },
  });
}

export function useDeleteMatchEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, matchId }: { eventId: string; matchId: string }) => {
      const { error } = await supabase
        .from("match_events")
        .delete()
        .eq("id", eventId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match-events", variables.matchId] });
    },
  });
}

export function useSaveMatchLineup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lineup: {
      match_id: string;
      team_id: string;
      goalkeeper_id: string | null;
      player_ids: string[];
    }) => {
      const { data, error } = await supabase
        .from("match_lineups")
        .upsert(lineup, { onConflict: "match_id,team_id" })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match-lineups", variables.match_id] });
    },
  });
}

export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, status, homeScore, awayScore }: {
      matchId: string;
      status: string;
      homeScore?: number;
      awayScore?: number;
    }) => {
      const updateData: Record<string, unknown> = { status };
      if (homeScore !== undefined) updateData.home_score = homeScore;
      if (awayScore !== undefined) updateData.away_score = awayScore;

      const { data, error } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", matchId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ["referee-matches"] });
    },
  });
}

export function useSubmitMatchReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: {
      match_id: string;
      attendance?: number;
      weather?: string;
      notes?: string;
      // Match officials
      centre_referee?: string;
      assistant_referee_1?: string;
      assistant_referee_2?: string;
      fourth_official?: string;
      match_commissioner?: string;
      home_coach?: string;
      away_coach?: string;
      half_time_home?: number;
      half_time_away?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if report already exists
      const { data: existingReport } = await supabase
        .from("match_reports")
        .select("id")
        .eq("match_id", report.match_id)
        .maybeSingle();
      
      const reportData = {
        attendance: report.attendance,
        weather: report.weather,
        notes: report.notes,
        centre_referee: report.centre_referee,
        assistant_referee_1: report.assistant_referee_1,
        assistant_referee_2: report.assistant_referee_2,
        fourth_official: report.fourth_official,
        match_commissioner: report.match_commissioner,
        home_coach: report.home_coach,
        away_coach: report.away_coach,
        half_time_home: report.half_time_home,
        half_time_away: report.half_time_away,
      };

      let data;
      let error;

      if (existingReport) {
        // Update existing report
        const result = await supabase
          .from("match_reports")
          .update(reportData)
          .eq("id", existingReport.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new report
        const result = await supabase
          .from("match_reports")
          .insert({
            match_id: report.match_id,
            referee_id: user?.id,
            ...reportData,
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;

      // Update match status to completed
      await supabase
        .from("matches")
        .update({ status: "completed" })
        .eq("id", report.match_id);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match-report", variables.match_id] });
      queryClient.invalidateQueries({ queryKey: ["match", variables.match_id] });
      queryClient.invalidateQueries({ queryKey: ["referee-matches"] });
    },
  });
}
