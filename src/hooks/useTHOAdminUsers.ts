import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface THOAdminUser {
  user_id: string;
  display_name: string;
}

export function useTHOAdminUsers() {
  return useQuery({
    queryKey: ["tho-admin-users"],
    queryFn: async () => {
      // Get all users with tho_admin role
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tho_admin");

      if (error) throw error;
      if (!userRoles?.length) return [];

      // Return user IDs with a truncated display name
      return userRoles.map((ur) => ({
        user_id: ur.user_id,
        display_name: `THO Admin (${ur.user_id.substring(0, 8)}...)`,
      }));
    },
  });
}

export function useTournamentAdmins(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ["tournament-admins-for", tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from("tournament_admins")
        .select("user_id")
        .eq("tournament_id", tournamentId);

      if (error) throw error;
      return data.map((ta) => ta.user_id);
    },
    enabled: !!tournamentId,
  });
}
