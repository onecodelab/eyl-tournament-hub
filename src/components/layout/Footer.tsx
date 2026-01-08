import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import eylLogo from "@/assets/eyl-logo.png";
import { useSponsors } from "@/hooks/useSponsors";

const footerLinks = {
  column1: [
    { name: "Ethiopian Youth League", href: "/" },
    { name: "Fantasy", href: "/fantasy" },
    { name: "Matches", href: "/matches" },
  ],
  column2: [
    { name: "Table", href: "/standings" },
    { name: "Statistics", href: "/statistics" },
    { name: "Latest News", href: "/news" },
  ],
  column3: [
    { name: "Latest Video", href: "/videos" },
    { name: "Clubs", href: "/clubs" },
    { name: "Players", href: "/players" },
  ],
};

const legalLinks = [
  { name: "Terms of Use", href: "/terms" },
  { name: "Policies", href: "/policies" },
  { name: "Cookie Policy", href: "/cookies" },
  { name: "Contact Us", href: "/contact" },
  { name: "Accessibility", href: "/accessibility" },
];

export function Footer() {
  const { data: sponsors = [] } = useSponsors("bottom");

  return (
    <footer className="bg-background border-t border-border">
      {/* Partners Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url || "#"}
                target={sponsor.website_url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
              >
                {sponsor.logo_url ? (
                  <img src={sponsor.logo_url} alt={sponsor.name} className="h-8 w-auto object-contain mb-1" />
                ) : (
                  <span className="text-foreground font-medium text-sm">{sponsor.name}</span>
                )}
                {sponsor.logo_url && <span className="text-foreground font-medium text-sm">{sponsor.name}</span>}
                <span className="text-muted-foreground text-xs">{sponsor.type}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            {footerLinks.column1.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            {footerLinks.column2.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            {footerLinks.column3.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Column 4: Logo + Social */}
          <div className="flex flex-col items-end gap-4">
            <img 
              src={eylLogo} 
              alt="Ethiopian Youth League" 
              className="h-20 md:h-24 w-auto drop-shadow-[0_0_20px_hsl(187,100%,50%,0.4)]" 
            />
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-[hsl(187,100%,50%)] hover:text-background transition-all duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-[hsl(187,100%,50%)] hover:text-background transition-all duration-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-[hsl(187,100%,50%)] hover:text-background transition-all duration-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-[hsl(187,100%,50%)] hover:text-background transition-all duration-300">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© ETHIOPIAN YOUTH LEAGUE 2026</span>
            <nav className="flex items-center gap-4">
              {legalLinks.map((link, index) => (
                <span key={link.name} className="flex items-center gap-4">
                  <Link to={link.href} className="hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && <span className="text-border">•</span>}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
