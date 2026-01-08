import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserWithRole {
  id: string;
  user_id: string;
  role: "admin" | "referee" | "user";
  email?: string;
}

export function useReferees() {
  return useQuery({
    queryKey: ["referees"],
    queryFn: async () => {
      // Get all users with referee role from user_roles table
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "referee");
      
      if (error) throw error;
      return roles as UserWithRole[];
    },
  });
}

export function useUserRoles() {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCurrentUserRole() {
  return useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
  });
}
