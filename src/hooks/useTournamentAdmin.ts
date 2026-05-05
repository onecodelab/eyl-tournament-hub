import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTournamentAdmin() {
  const { user } = useAuth();
  
  const { data: assignedTournaments = [], isLoading } = useQuery({
    queryKey: ["assigned-tournaments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("DEBUG: Checking tournament_admins for user ID:", user.id);

      // We strictly ONLY fetch tournaments assigned in the tournament_admins table.
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
        console.error("DEBUG: Supabase error:", error);
        throw error;
      }
      
      const flattened = (data || [])
        .map((item: any) => item.tournaments)
        .filter(Boolean);
      
      console.log("DEBUG: Found assigned tournaments:", flattened.length);
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
