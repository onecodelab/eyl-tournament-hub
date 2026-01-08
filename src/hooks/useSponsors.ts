import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  type: string | null;
  position: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useSponsors(position?: "top" | "bottom" | "both") {
  return useQuery({
    queryKey: ["sponsors", position],
    queryFn: async () => {
      let query = supabase
        .from("sponsors")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (position && position !== "both") {
        query = query.or(`position.eq.${position},position.eq.both`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Sponsor[];
    },
  });
}

export function useAllSponsors() {
  return useQuery({
    queryKey: ["sponsors", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Sponsor[];
    },
  });
}

export function useCreateSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sponsor: Omit<Sponsor, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("sponsors").insert(sponsor).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors"] }),
  });
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sponsor> & { id: string }) => {
      const { data, error } = await supabase.from("sponsors").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors"] }),
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sponsors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors"] }),
  });
}
