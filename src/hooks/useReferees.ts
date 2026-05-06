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
      // Tournament admins cannot read every row in user_roles because of RLS,
      // so use the security-definer RPC that returns referee accounts with email addresses.
      const { data, error } = await supabase.rpc("get_referees_with_email");

      if (error) throw error;

      return (data || []).map((referee) => ({
        ...referee,
        email: referee.email || "Unknown Referee",
      })) as RefereeWithEmail[];
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

