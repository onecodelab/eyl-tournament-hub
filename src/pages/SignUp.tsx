import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Lock, Loader2, ArrowRight, Check, X } from "lucide-react";
import eylLogo from "@/assets/eyl-logo.png";

/**
 * Security-hardened SignUp page.
 * 
 * MobSF fixes applied:
 * - CWE-521: Strong password policy (min 8 chars, uppercase, lowercase, number, special)
 * - CWE-200: Generic error messages
 * - Input sanitization and validation
 */

interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label = "Very Weak";
  let color = "bg-red-500";
  if (score >= 5) { label = "Strong"; color = "bg-emerald-500"; }
  else if (score >= 4) { label = "Good"; color = "bg-blue-500"; }
  else if (score >= 3) { label = "Fair"; color = "bg-amber-500"; }
  else if (score >= 2) { label = "Weak"; color = "bg-orange-500"; }

  return { score, label, color, checks };
}

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const sanitizeEmail = (input: string): string => {
    return input.trim().toLowerCase().slice(0, 254);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedEmail = sanitizeEmail(email);

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

    // Strong password enforcement (CWE-521)
    if (passwordStrength.score < 4) {
      toast({ 
        title: "Weak Password", 
        description: "Password must meet at least 4 of 5 security requirements.", 
        variant: "destructive" 
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email: sanitizedEmail, 
        password 
      });
      if (error) throw error;

      toast({ 
        title: "Registration successful!", 
        description: "Please check your email for a confirmation link, then you can sign in." 
      });
      navigate("/login");
    } catch {
      // Generic error to prevent user enumeration
      toast({ 
        title: "Registration failed", 
        description: "Unable to create account. Please try again or use a different email.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? "text-emerald-500" : "text-muted-foreground/60"}`}>
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-center">
              <img src={eylLogo} alt="EYL" className="h-16 w-auto drop-shadow-[0_0_12px_hsl(187,100%,50%,0.4)]" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Join the Ethiopian Youth League platform</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-white/10"
                  maxLength={254}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2 text-sm">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-white/10"
                  maxLength={128}
                  required
                />

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${
                        passwordStrength.score >= 4 ? "text-emerald-500" : 
                        passwordStrength.score >= 3 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <CheckItem passed={passwordStrength.checks.length} label="8+ characters" />
                      <CheckItem passed={passwordStrength.checks.uppercase} label="Uppercase (A-Z)" />
                      <CheckItem passed={passwordStrength.checks.lowercase} label="Lowercase (a-z)" />
                      <CheckItem passed={passwordStrength.checks.number} label="Number (0-9)" />
                      <CheckItem passed={passwordStrength.checks.special} label="Special (!@#$...)" />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="flex items-center gap-2 text-sm">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Confirm Password
                </Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-11 border-white/10 ${
                    confirmPassword.length > 0 
                      ? passwordsMatch ? "border-emerald-500/50" : "border-red-500/50" 
                      : ""
                  }`}
                  maxLength={128}
                  required
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 gap-2 text-sm font-semibold shadow-lg shadow-primary/20" 
                disabled={loading || passwordStrength.score < 4 || !passwordsMatch}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                  Sign In <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
