import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, User, X, LogOut, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { ThemeToggle } from "@/components/ThemeToggle";
import eylLogo from "@/assets/eyl-logo.png";

const topNavLinks = [
  { name: "Ethiopian Youth League", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Events", href: "/matches" },
  { name: "Youth Competitions", href: "/standings" },
  { name: "Media", href: "/news" },
];

const mainNavLinks = [
  { name: "Tournaments", href: "/standings" },
  { name: "Fixtures", href: "/matches" },
  { name: "News", href: "/news" },
  { name: "Watch Live", href: "/live", highlight: true },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isReferee } = useUserRole();

  const handleAuthClick = async () => {
    if (user) {
      await signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar - Elite Intelligence Strip */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-8">
            <nav className="hidden lg:flex items-center gap-6">
              {topNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="data-precision-mono text-[10px] text-muted-foreground hover:text-foreground dark:text-white/40 dark:hover:text-white transition-colors uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <span className="data-precision-mono text-[10px] text-muted-foreground/60 dark:text-white/20 tracking-widest">© 2026 ETHIOPIAN YOUTH LEAGUE</span>
          </div>
        </div>
      </div>

      {/* Main Nav - Premium Command Bar */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <img src={eylLogo} alt="EYL" className="h-10 md:h-12 w-auto drop-shadow-[0_0_8px_hsl(187,100%,50%,0.3)]" />
              </Link>
            </div>

            {/* Center: Main Nav Links */}
            <nav className="hidden lg:flex items-center justify-center gap-8 flex-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative text-xs font-black uppercase tracking-widest transition-colors py-1 ${
                    link.highlight
                      ? "text-primary hover:text-primary/80 flex items-center gap-2"
                      : location.pathname === link.href
                      ? "text-foreground dark:text-white"
                      : "text-muted-foreground hover:text-foreground dark:text-white/40 dark:hover:text-white"
                  }`}
                >
                  {link.highlight && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  {link.name}
                  {location.pathname === link.href && !link.highlight && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_hsl(187,100%,50%,0.5)]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right: Theme Toggle + Search + Auth */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              {isReferee && (
                <Link
                  to="/referee"
                  className={`hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    location.pathname.startsWith("/referee")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Referee
                </Link>
              )}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground truncate max-w-[120px]">
                    {user.email}
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleAuthClick} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={handleAuthClick} className="hidden sm:flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-white/5">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`py-2 px-3 rounded-lg text-sm font-medium ${
                  link.highlight
                    ? "text-primary"
                    : location.pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isReferee && (
              <Link
                to="/referee"
                className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  location.pathname.startsWith("/referee")
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ClipboardList className="h-4 w-4" />
                Referee Dashboard
              </Link>
            )}
            <div className="border-t border-border my-2" />
            {user ? (
              <>
                <Link
                  to="/admin"
                  className="py-2 px-3 rounded-lg text-sm text-muted-foreground truncate"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user.email}
                </Link>
                <button
                  onClick={() => { handleAuthClick(); setMobileMenuOpen(false); }}
                  className="py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
                className="py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
