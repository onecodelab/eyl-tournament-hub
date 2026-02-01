import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlayerStats {
  goals: number;
  assists: number;
  appearances: number;
}

// Hook to get calculated stats for a single player
export function usePlayerStats(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player-stats", playerId],
    queryFn: async (): Promise<PlayerStats> => {
      if (!playerId) return { goals: 0, assists: 0, appearances: 0 };

      const { data, error } = await supabase
        .rpc("get_player_stats", { p_player_id: playerId });

      if (error) {
        console.error("Error fetching player stats:", error);
        return { goals: 0, assists: 0, appearances: 0 };
      }

      // RPC returns an array, get first row
      const stats = data?.[0] || { goals: 0, assists: 0, appearances: 0 };
      return stats;
    },
    enabled: !!playerId,
  });
}

// Hook to get top scorers from match events
export function useTopScorers(limit: number = 10) {
  return useQuery({
    queryKey: ["top-scorers", limit],
    queryFn: async () => {
      // Get all goal events from completed matches with player info
      const { data: events, error } = await supabase
        .from("match_events")
        .select(`
          player_id,
          match_id,
          matches!inner(status)
        `)
        .eq("event_type", "goal")
        .eq("matches.status", "completed");

      if (error) throw error;

      // Count goals per player
      const goalCounts: Record<string, number> = {};
      events?.forEach((e) => {
        if (e.player_id) {
          goalCounts[e.player_id] = (goalCounts[e.player_id] || 0) + 1;
        }
      });

      // Get player details for top scorers
      const playerIds = Object.keys(goalCounts);
      if (playerIds.length === 0) return [];

      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("id, name, photo_url, team_id, teams(name, logo_url)")
        .in("id", playerIds);

      if (playersError) throw playersError;

      // Combine and sort
      const scorers = players?.map((p) => ({
        ...p,
        goals: goalCounts[p.id] || 0,
        team: (p as any).teams,
      }))
        .sort((a, b) => b.goals - a.goals)
        .slice(0, limit);

      return scorers || [];
    },
  });
}

// Hook to get top assisters from match events
export function useTopAssisters(limit: number = 10) {
  return useQuery({
    queryKey: ["top-assisters", limit],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("match_events")
        .select(`
          player_id,
          match_id,
          matches!inner(status)
        `)
        .eq("event_type", "assist")
        .eq("matches.status", "completed");

      if (error) throw error;

      const assistCounts: Record<string, number> = {};
      events?.forEach((e) => {
        if (e.player_id) {
          assistCounts[e.player_id] = (assistCounts[e.player_id] || 0) + 1;
        }
      });

      const playerIds = Object.keys(assistCounts);
      if (playerIds.length === 0) return [];

      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("id, name, photo_url, team_id, teams(name, logo_url)")
        .in("id", playerIds);

      if (playersError) throw playersError;

      const assisters = players?.map((p) => ({
        ...p,
        assists: assistCounts[p.id] || 0,
        team: (p as any).teams,
      }))
        .sort((a, b) => b.assists - a.assists)
        .slice(0, limit);

      return assisters || [];
    },
  });
}

// Hook to get players with most appearances
export function useTopAppearances(limit: number = 10) {
  return useQuery({
    queryKey: ["top-appearances", limit],
    queryFn: async () => {
      // Get all lineups from completed matches
      const { data: lineups, error } = await supabase
        .from("match_lineups")
        .select(`
          goalkeeper_id,
          player_ids,
          match_id,
          matches!inner(status)
        `)
        .eq("matches.status", "completed");

      if (error) throw error;

      // Count appearances per player
      const appearanceCounts: Record<string, number> = {};
      lineups?.forEach((l) => {
        if (l.goalkeeper_id) {
          appearanceCounts[l.goalkeeper_id] = (appearanceCounts[l.goalkeeper_id] || 0) + 1;
        }
        l.player_ids?.forEach((pid) => {
          if (pid) {
            appearanceCounts[pid] = (appearanceCounts[pid] || 0) + 1;
          }
        });
      });

      const playerIds = Object.keys(appearanceCounts);
      if (playerIds.length === 0) return [];

      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("id, name, photo_url, team_id, teams(name, logo_url)")
        .in("id", playerIds);

      if (playersError) throw playersError;

      const appearers = players?.map((p) => ({
        ...p,
        appearances: appearanceCounts[p.id] || 0,
        team: (p as any).teams,
      }))
        .sort((a, b) => b.appearances - a.appearances)
        .slice(0, limit);

      return appearers || [];
    },
  });
}
