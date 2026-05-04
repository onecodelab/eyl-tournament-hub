import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTournamentAdmin() {
  const { user } = useAuth();
  
  const { data: assignedTournaments = [], isLoading } = useQuery({
    queryKey: ["assigned-tournaments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("Fetching tournaments for user:", user.email, "ID:", user.id);

      // Check user role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (roleError) {
        console.error("Error fetching roles:", roleError);
        return [];
      }

      const isSuperAdmin = roles?.some(r => r.role === "admin");
      console.log("User roles:", roles, "isSuperAdmin:", isSuperAdmin);

      if (isSuperAdmin) {
        // Super admins see everything
        const { data, error } = await supabase
          .from("tournaments")
          .select("id, name, logo_url, status")
          .order("name", { ascending: true });
        
        if (error) throw error;
        return data || [];
      }

      // THO Admins only see specifically assigned tournaments
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
