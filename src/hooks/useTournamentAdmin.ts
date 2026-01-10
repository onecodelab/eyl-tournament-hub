import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTournamentAdmin() {
  const { user } = useAuth();

  const { data: assignedTournaments = [], isLoading } = useQuery({
    queryKey: ["tournament-admins", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("tournament_admins")
        .select(`
          tournament_id,
          tournaments (
            id,
            name,
            logo_url,
            status
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((ta) => ta.tournaments).filter(Boolean);
    },
    enabled: !!user?.id,
  });

  const { data: tournamentIds = [] } = useQuery({
    queryKey: ["tournament-admin-ids", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("tournament_admins")
        .select("tournament_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((ta) => ta.tournament_id);
    },
    enabled: !!user?.id,
  });

  return {
    assignedTournaments,
    tournamentIds,
    isLoading,
    hasTournaments: assignedTournaments.length > 0,
  };
}
