import { useTournamentSponsors } from "@/hooks/useTournamentSponsors";

interface TournamentSponsorBannerProps {
  tournamentId: string;
}

export function TournamentSponsorBanner({ tournamentId }: TournamentSponsorBannerProps) {
  const { data: sponsors = [] } = useTournamentSponsors(tournamentId);

  if (sponsors.length === 0) return null;

  return (
    <div className="w-full border-b border-border/20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-3 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] uppercase tracking-[0.25em] text-primary/60 font-semibold whitespace-nowrap flex-shrink-0">
            Partners
          </span>
          <div className="h-4 w-px bg-border/40 flex-shrink-0" />
          <div className="flex items-center gap-6">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url || "#"}
                target={sponsor.website_url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-all duration-300 hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                title={sponsor.name}
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-8 md:h-10 w-auto object-contain rounded-sm transition-all duration-300"
                  />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground/80 whitespace-nowrap px-3 py-1.5 rounded-md bg-muted/40 border border-border/30">
                    {sponsor.name}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
