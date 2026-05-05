import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserWithRole {
  id: string;
  user_id: string;
  role: "admin" | "referee" | "user" | "tho_admin";
  email?: string;
  created_at?: string;
}

interface RefereeWithEmail {
  id: string;
  user_id: string;
  role: string;
  email: string;
  created_at: string;
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

// Hook that fetches referees with their emails reliably
export function useRefereesWithEmail() {
  return useQuery({
    queryKey: ["referees-with-email"],
    queryFn: async () => {
      // 1. Get all user IDs with the 'referee' role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "referee");
      
      if (rolesError) throw rolesError;
      
      // 2. Resolve emails for each referee
      const refereesWithEmail = await Promise.all(
        (roles || []).map(async (role) => {
          try {
            const { data: email } = await supabase
              .rpc("get_user_email", { _user_id: role.user_id });
            return { ...role, email: email || "Unknown Referee" };
          } catch (e) {
            return { ...role, email: "Unknown Referee" };
          }
        })
      );
      
      return refereesWithEmail as RefereeWithEmail[];
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

// Hook to get user roles with emails for admin management
export function useUserRolesWithEmail() {
  return useQuery({
    queryKey: ["user-roles-with-email"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (rolesError) throw rolesError;
      
      // Fetch emails for each user
      const rolesWithEmail = await Promise.all(
        (roles || []).map(async (role) => {
          const { data: email } = await supabase
            .rpc("get_user_email", { _user_id: role.user_id });
          return { ...role, email: email || "Unknown" };
        })
      );
      
      return rolesWithEmail;
    },
  });
}

