import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";

type UserRole = "admin" | "tho_admin" | "referee" | "user";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to access this route. If empty, any authenticated user can access. */
  allowedRoles?: UserRole[];
  /** Redirect path when unauthorized (defaults to /login) */
  redirectTo?: string;
}

/**
 * ProtectedRoute — Server-verified Role-Based Access Control guard.
 * 
 * Security hardening based on MobSF rules:
 * - CWE-284: Improper Access Control
 * - CWE-602: Client-Side Enforcement of Server-Side Security
 * - OWASP M1: Improper Platform Usage
 * 
 * This component:
 * 1. Verifies authentication state via Supabase session
 * 2. Fetches user role from server (not cached/spoofable)
 * 3. Blocks rendering until verification completes
 * 4. Redirects unauthorized users with no flash of protected content
 */
export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [roleVerified, setRoleVerified] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      // Wait for auth to resolve
      if (authLoading) return;

      // Not authenticated → redirect to login
      if (!user) {
        navigate(redirectTo, { replace: true });
        return;
      }

      // If no specific roles required, any authenticated user can access
      if (allowedRoles.length === 0) {
        if (isMounted) {
          setRoleVerified(true);
          setVerifying(false);
        }
        return;
      }

      try {
        // CRITICAL: Always fetch role from server, never trust client state
        // This prevents role spoofing via localStorage/sessionStorage manipulation
        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) throw error;

        const userRoles = (roles || []).map((r) => r.role as UserRole);
        const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

        if (isMounted) {
          if (hasAccess) {
            setRoleVerified(true);
            setAccessDenied(false);
          } else {
            setAccessDenied(true);
            setRoleVerified(false);
          }
          setVerifying(false);
        }
      } catch {
        // On error, deny access (fail-closed security)
        if (isMounted) {
          setAccessDenied(true);
          setVerifying(false);
        }
      }
    }

    verifyAccess();
    return () => { isMounted = false; };
  }, [user, authLoading, allowedRoles, navigate, redirectTo]);

  // Show loading spinner while verifying (prevents flash of protected content)
  if (authLoading || verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Verifying access...
        </p>
      </div>
    );
  }

  // Access denied — show denial page (not redirect, so user knows what happened)
  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You don't have the required permissions to access this page. 
            Contact your administrator if you believe this is an error.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role verified — render protected content
  if (roleVerified) {
    return <>{children}</>;
  }

  return null;
}
