import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

// Player mutations
export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (player: PlayerInsert) => {
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

// Match mutations
export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (match: MatchInsert) => {
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
