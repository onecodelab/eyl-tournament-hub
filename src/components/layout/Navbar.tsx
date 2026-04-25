import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          </nav>
        </div>
      )}
    </header>
  );
}
