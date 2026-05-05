import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTournamentAdmin() {
  const { user } = useAuth();
  
  const { data: assignedTournaments = [], isLoading } = useQuery({
    queryKey: ["assigned-tournaments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("Fetching assigned tournaments for user:", user.email);

      // We strictly ONLY fetch tournaments assigned in the tournament_admins table.
      // Even Super Admins must be assigned to a tournament to see it here.
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

      if (error) {
        console.error("Error fetching assigned tournaments:", error);
        throw error;
      }
      
      const flattened = (data || [])
        .map((item: any) => item.tournaments)
        .filter(Boolean);
      
      console.log("Assigned tournaments found:", flattened.length);
      return flattened;
    },
    enabled: !!user,
  });

  return {
    assignedTournaments,
    tournamentIds: assignedTournaments.map((t: any) => t.id),
    isLoading,
    hasTournaments: assignedTournaments.length > 0,
  };
}
