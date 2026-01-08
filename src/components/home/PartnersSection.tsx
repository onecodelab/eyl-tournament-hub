import { useSponsors } from "@/hooks/useSponsors";

export function PartnersSection() {
  const { data: sponsors = [] } = useSponsors("top");

  // Generate abbreviation from name
  const getAbbr = (name: string) => {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  if (sponsors.length === 0) return null;

  return (
    <section className="border-y border-border/50 py-4 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8">
          <span className="text-muted-foreground text-sm whitespace-nowrap">Official Partners</span>
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url || "#"}
                target={sponsor.website_url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {sponsor.logo_url ? (
                  <img src={sponsor.logo_url} alt={sponsor.name} className="h-5 w-auto object-contain" />
                ) : (
                  <span className="font-bold text-primary">{getAbbr(sponsor.name)}</span>
                )}
                <span className="text-sm whitespace-nowrap">{sponsor.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
