import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TournamentSponsor {
  id: string;
  tournament_id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useTournamentSponsors(tournamentId?: string) {
  return useQuery({
    queryKey: ["tournament-sponsors", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_sponsors" as any)
        .select("*")
        .eq("tournament_id", tournamentId!)
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as TournamentSponsor[];
    },
    enabled: !!tournamentId,
  });
}

export function useAllTournamentSponsors(tournamentId?: string) {
  return useQuery({
    queryKey: ["tournament-sponsors", "all", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_sponsors" as any)
        .select("*")
        .eq("tournament_id", tournamentId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as TournamentSponsor[];
    },
    enabled: !!tournamentId,
  });
}

export function useCreateTournamentSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sponsor: Omit<TournamentSponsor, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("tournament_sponsors" as any)
        .insert(sponsor as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournament-sponsors"] }),
  });
}

export function useUpdateTournamentSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TournamentSponsor> & { id: string }) => {
      const { data, error } = await supabase
        .from("tournament_sponsors" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournament-sponsors"] }),
  });
}

export function useDeleteTournamentSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tournament_sponsors" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournament-sponsors"] }),
  });
}
