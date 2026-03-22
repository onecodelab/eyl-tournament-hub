import { useTournamentSponsors } from "@/hooks/useTournamentSponsors";

interface TournamentSponsorBannerProps {
  tournamentId: string;
}

export function TournamentSponsorBanner({ tournamentId }: TournamentSponsorBannerProps) {
  const { data: sponsors = [] } = useTournamentSponsors(tournamentId);

  if (sponsors.length === 0) return null;

  return (
    <div className="w-full border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-2.5 overflow-x-auto scrollbar-hide">
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium whitespace-nowrap flex-shrink-0">
            Partners
          </span>
          <div className="h-3 w-px bg-border/30 flex-shrink-0" />
          <div className="flex items-center gap-5">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url || "#"}
                target={sponsor.website_url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity duration-300"
                title={sponsor.name}
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-5 md:h-6 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <span className="text-[10px] font-medium text-muted-foreground/60 whitespace-nowrap">
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
