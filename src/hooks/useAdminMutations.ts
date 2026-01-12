import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { 
  tournamentSchema, 
  teamSchema, 
  playerSchema, 
  matchSchema, 
  newsSchema, 
  videoSchema,
  validateSchema 
} from "@/lib/schemas";

type TournamentInsert = Database["public"]["Tables"]["tournaments"]["Insert"];
type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"];
type NewsInsert = Database["public"]["Tables"]["news"]["Insert"];

// Tournament mutations
export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tournament: TournamentInsert) => {
      const validation = validateSchema(tournamentSchema, tournament);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("tournaments").insert(tournament).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...tournament }: TournamentInsert & { id: string }) => {
      const validation = validateSchema(tournamentSchema, tournament);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("tournaments").update(tournament).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });
}

// Team mutations
export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (team: TeamInsert) => {
      const validation = validateSchema(teamSchema, team);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("teams").insert(team).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...team }: TeamInsert & { id: string }) => {
      const validation = validateSchema(teamSchema, team);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("teams").update(team).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

// Bulk Team Import
export function useBulkCreateTeams() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teams: TeamInsert[]) => {
      if (teams.length === 0) throw new Error("No teams to import");
      
      const { data, error } = await supabase.from("teams").insert(teams).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

// Player mutations
export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (player: PlayerInsert) => {
      const validation = validateSchema(playerSchema, player);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("players").insert(player).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...player }: PlayerInsert & { id: string }) => {
      const validation = validateSchema(playerSchema, player);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("players").update(player).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });
}

// Bulk Player Import
export function useBulkCreatePlayers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (players: PlayerInsert[]) => {
      if (players.length === 0) throw new Error("No players to import");
      
      const { data, error } = await supabase.from("players").insert(players).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });
}

// Match mutations
export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (match: MatchInsert) => {
      const validation = validateSchema(matchSchema, match);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("matches").insert(match).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["all-matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches-with-teams"] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...match }: MatchInsert & { id: string }) => {
      const validation = validateSchema(matchSchema, match);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("matches").update(match).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["all-matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches-with-teams"] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["all-matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches-with-teams"] });
    },
  });
}

// News mutations
export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (news: NewsInsert) => {
      const validation = validateSchema(newsSchema, news);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("news").insert(news).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["news"] }),
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...news }: NewsInsert & { id: string }) => {
      const validation = validateSchema(newsSchema, news);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("news").update(news).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["news"] }),
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["news"] }),
  });
}

// Video mutations
interface VideoInsert {
  title: string;
  youtube_url: string;
  thumbnail_url?: string;
  views_count?: number;
  is_featured?: boolean;
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: VideoInsert) => {
      const validation = validateSchema(videoSchema, video);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("videos").insert(video).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...video }: VideoInsert & { id: string }) => {
      const validation = validateSchema(videoSchema, video);
      if (!validation.success) {
        throw new Error(Object.values(validation.errors || {}).join(', '));
      }
      const { data, error } = await supabase.from("videos").update(video).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });
}
