import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, X, LogIn, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar - Elite Intelligence Strip */}
      <div className="bg-background border-b border-white/[0.06] transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-8">
            <nav className="hidden lg:flex items-center gap-6">
              {topNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-[12px] font-medium text-[#9c9c9d] hover:text-white transition-colors tracking-wide"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <span className="text-[12px] text-[#6a6b6c] tracking-wide font-medium">© 2026 ETHIOPIAN YOUTH LEAGUE</span>
          </div>
        </div>
      </div>

      {/* Main Nav - Premium Command Bar */}
      <div className="bg-background border-b border-white/[0.06]">
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
                  className={`relative text-[16px] font-medium tracking-[0.3px] transition-colors py-1 ${
                    link.highlight
                      ? "text-primary hover:text-primary/80 flex items-center gap-2"
                      : location.pathname === link.href
                      ? "text-white"
                      : "text-[#9c9c9d] hover:text-white"
                  }`}
                >
                  {link.highlight && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                  {link.name}
                  {location.pathname === link.href && !link.highlight && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-white/20" />
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

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5" />
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Signed In</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-white/[0.06]">
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
            <div className="border-t border-border my-2" />
            {user ? (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 text-destructive"
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
