import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];
type Match = Database["public"]["Tables"]["matches"]["Row"];
type News = Database["public"]["Tables"]["news"]["Row"];

// Video type - defined locally since table was just created
interface Video {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  views_count: number | null;
  is_featured: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tournament[];
    },
  });
}

export function useTournamentHubs() {
  return useQuery({
    queryKey: ["tournament-hubs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_hubs")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useTeams(tournamentId?: string) {
  return useQuery({
    queryKey: ["teams", tournamentId],
    queryFn: async () => {
      let query = supabase.from("teams").select("*").order("points", { ascending: false });
      if (tournamentId) {
        query = query.eq("tournament_id", tournamentId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Team[];
    },
  });
}

export function usePlayers(options?: { teamId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["players", options],
    queryFn: async () => {
      let query = supabase.from("players").select("*").order("goals", { ascending: false });
      if (options?.teamId) {
        query = query.eq("team_id", options.teamId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Player[];
    },
  });
}

export function useMatches(options?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ["matches", options],
    queryFn: async () => {
      let query = supabase.from("matches").select("*").order("match_date", { ascending: true });
      if (options?.status) {
        query = query.eq("status", options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Match[];
    },
  });
}

export function useAllMatches() {
  return useQuery({
    queryKey: ["all-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });
      if (error) throw error;
      return data as Match[];
    },
  });
}

export function useNews(options?: { featured?: boolean; limit?: number; category?: string }) {
  return useQuery({
    queryKey: ["news", options],
    queryFn: async () => {
      let query = supabase.from("news").select("*").order("published_at", { ascending: false });
      if (options?.featured) {
        query = query.eq("is_featured", true);
      }
      if (options?.category && options.category !== "All") {
        query = query.eq("category", options.category);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as News[];
    },
  });
}

export function useMatchWithTeams() {
  return useQuery({
    queryKey: ["matches-with-teams"],
    queryFn: async () => {
      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });
      
      if (matchError) throw matchError;

      const { data: teams, error: teamError } = await supabase.from("teams").select("*");
      if (teamError) throw teamError;

      const teamsMap = new Map(teams.map((t) => [t.id, t]));

      return matches.map((match) => ({
        ...match,
        home_team: teamsMap.get(match.home_team_id || "") || null,
        away_team: teamsMap.get(match.away_team_id || "") || null,
      }));
    },
  });
}

export function useNewsById(id: string) {
  return useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as News;
    },
    enabled: !!id,
  });
}

export function useVideos(options?: { featured?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["videos", options],
    queryFn: async () => {
      let query = supabase
        .from("videos")
        .select("*")
        .order("published_at", { ascending: false });
      if (options?.featured) {
        query = query.eq("is_featured", true);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Video[];
    },
  });
}
