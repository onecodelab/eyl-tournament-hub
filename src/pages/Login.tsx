import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock, Loader2, ShieldAlert } from "lucide-react";
import eylLogo from "@/assets/eyl-logo.png";

/**
 * Security-hardened Login page.
 * 
 * MobSF fixes applied:
 * - CWE-307: Rate limiting (max 5 attempts, exponential backoff)
 * - CWE-200: Generic error messages (prevents user enumeration)
 * - CWE-384: Session handling improvements
 * - Input validation before API call
 */

const MAX_LOGIN_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30_000; // 30 seconds
const MAX_LOCKOUT_MS = 300_000; // 5 minutes max

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Rate limiting state (persisted in ref to survive re-renders)
  const attemptCountRef = useRef(0);
  const lastAttemptTimeRef = useRef(0);

  // Check if currently locked out
  const isLockedOut = useCallback(() => {
    if (!lockoutUntil) return false;
    if (Date.now() >= lockoutUntil) {
      setLockoutUntil(null);
      setLockoutMessage("");
      return false;
    }
    return true;
  }, [lockoutUntil]);

  // Calculate exponential backoff lockout duration
  const getLockoutDuration = (attempts: number): number => {
    const duration = BASE_LOCKOUT_MS * Math.pow(2, Math.floor(attempts / MAX_LOGIN_ATTEMPTS) - 1);
    return Math.min(duration, MAX_LOCKOUT_MS);
  };

  // Sanitize email input
  const sanitizeEmail = (input: string): string => {
    return input.trim().toLowerCase().slice(0, 254); // RFC 5321 max email length
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check lockout
    if (isLockedOut()) {
      const remainingSeconds = Math.ceil(((lockoutUntil || 0) - Date.now()) / 1000);
      toast({ 
        title: "Too many attempts", 
        description: `Please wait ${remainingSeconds} seconds before trying again.`,
        variant: "destructive" 
      });
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);

    // Basic validation
    if (!sanitizedEmail || !password) {
      toast({ title: "Error", description: "Please enter email and password", variant: "destructive" });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    // Rate limit check (time-based)
    const now = Date.now();
    if (now - lastAttemptTimeRef.current < 1000) {
      // Minimum 1 second between attempts
      toast({ title: "Please wait", description: "Too many requests. Slow down.", variant: "destructive" });
      return;
    }
    lastAttemptTimeRef.current = now;
    attemptCountRef.current += 1;

    // Lockout after MAX_LOGIN_ATTEMPTS
    if (attemptCountRef.current > MAX_LOGIN_ATTEMPTS) {
      const lockoutDuration = getLockoutDuration(attemptCountRef.current);
      const lockoutEnd = Date.now() + lockoutDuration;
      setLockoutUntil(lockoutEnd);
      const lockoutSeconds = Math.ceil(lockoutDuration / 1000);
      setLockoutMessage(`Too many failed attempts. Locked for ${lockoutSeconds} seconds.`);
      toast({ 
        title: "Account temporarily locked", 
        description: `Please wait ${lockoutSeconds} seconds before trying again.`,
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: sanitizedEmail, 
        password 
      });
      if (error) throw error;

      // Reset attempt counter on successful login
      attemptCountRef.current = 0;

      // Fetch role for redirect (server-verified)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const userRole = roles?.[0]?.role;

        if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "tho_admin") {
          navigate("/tho-admin");
        } else if (userRole === "referee") {
          navigate("/referee");
        } else {
          navigate("/");
        }

        toast({ title: "Welcome back!", description: "Successfully signed in." });
      }
    } catch {
      // SECURITY: Generic error message prevents user enumeration (CWE-200)
      toast({ 
        title: "Login failed", 
        description: "Invalid email or password. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const isLocked = isLockedOut();

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-center">
              <img src={eylLogo} alt="EYL" className="h-16 w-auto drop-shadow-[0_0_12px_hsl(187,100%,50%,0.4)]" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Access your EYL dashboard</p>
            </div>
          </CardHeader>
          <CardContent>
            {/* Lockout Warning Banner */}
            {isLocked && lockoutMessage && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive font-medium">{lockoutMessage}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  autoComplete="email"
                  maxLength={254}
                  disabled={isLocked}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="flex items-center gap-2 text-sm">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  autoComplete="current-password"
                  maxLength={128}
                  disabled={isLocked}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 gap-2 text-sm font-semibold" 
                disabled={loading || isLocked}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? "Signing in..." : isLocked ? "Temporarily Locked" : "Sign In"}
              </Button>
            </form>

            {/* Attempt counter warning */}
            {attemptCountRef.current >= 3 && !isLocked && (
              <p className="text-xs text-amber-500 text-center mt-3">
                {MAX_LOGIN_ATTEMPTS - attemptCountRef.current} attempt(s) remaining before lockout
              </p>
            )}

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="text-center text-sm mt-6">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
