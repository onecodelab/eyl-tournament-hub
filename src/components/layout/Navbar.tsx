import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import eylLogo from "@/assets/eyl-logo.png";

const topNavLinks = [
  { name: "Ethiopian Youth League", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Football & Community", href: "/community" },
  { name: "Events", href: "/matches" },
  { name: "Youth Competitions", href: "/standings" },
  { name: "Media", href: "/news" },
];

const mainNavLinks = [
  { name: "Matches", href: "/matches" },
  { name: "Table", href: "/standings" },
  { name: "Statistics", href: "/statistics" },
  { name: "News", href: "/news" },
  { name: "Clubs", href: "/clubs" },
  { name: "Watch Live", href: "/live", highlight: true },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-xs">
            <nav className="hidden lg:flex items-center gap-6">
              {topNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="nav-link hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <span className="text-muted-foreground">© 2026 EYL</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Link to="/" className="flex items-center">
                <img src={eylLogo} alt="EYL" className="h-8 w-auto" />
              </Link>
            </div>

            {/* Center: Main Nav Links */}
            <nav className="hidden lg:flex items-center gap-6">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${
                    link.highlight
                      ? "text-primary hover:text-primary/80"
                      : location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right: Search + Sign In */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-border">
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
          </nav>
        </div>
      )}
    </header>
  );
}
