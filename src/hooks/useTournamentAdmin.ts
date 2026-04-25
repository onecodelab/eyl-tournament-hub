import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTournamentAdmin() {
  const { data: assignedTournaments = [], isLoading } = useQuery({
    queryKey: ["all-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id, name, logo_url, status");

      if (error) throw error;
      return data || [];
    },
  });

  return {
    assignedTournaments,
    tournamentIds: assignedTournaments.map(t => t.id),
    isLoading,
    hasTournaments: assignedTournaments.length > 0,
  };
}
