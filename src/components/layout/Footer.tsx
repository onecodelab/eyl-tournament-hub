import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import eylLogo from "@/assets/eyl-logo.png";

const partners = [
  { name: "Ethio Telecom", role: "Lead Partner" },
  { name: "Dashen Bank", role: "Official Bank" },
  { name: "Ethiopian Airlines", role: "Official Carrier" },
  { name: "Abyssinia Bank", role: "Official Partner" },
  { name: "Gomeju Oil", role: "Official Sponsor" },
  { name: "Awash Bank", role: "Official Partner" },
];

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
  return (
    <footer className="bg-background border-t border-border">
      {/* Partners Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {partners.map((partner) => (
              <div key={partner.name} className="flex flex-col items-center gap-1">
                <span className="text-foreground font-medium text-sm">{partner.name}</span>
                <span className="text-muted-foreground text-xs">{partner.role}</span>
              </div>
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
            <img src={eylLogo} alt="EYL" className="h-12 w-auto opacity-80" />
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
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
