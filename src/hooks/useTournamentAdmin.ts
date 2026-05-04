import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTournamentAdmin() {
  const { data: assignedTournaments = [], isLoading } = useQuery({
    queryKey: ["assigned-tournaments"],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Check if user is super admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      const isSuperAdmin = roles?.some(r => r.role === "admin");

      if (isSuperAdmin) {
        // Super admins see everything
        const { data, error } = await supabase
          .from("tournaments")
          .select("id, name, logo_url, status")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }

      // THO Admins only see assigned tournaments
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
      
      // Flatten the nested structure
      return (data || [])
        .map((item: any) => item.tournaments)
        .filter(Boolean);
    },
  });

  return {
    assignedTournaments,
    tournamentIds: assignedTournaments.map((t: any) => t.id),
    isLoading,
    hasTournaments: assignedTournaments.length > 0,
  };
}
