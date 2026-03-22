import { useTournamentSponsors } from "@/hooks/useTournamentSponsors";

interface TournamentSponsorBannerProps {
  tournamentId: string;
}

export function TournamentSponsorBanner({ tournamentId }: TournamentSponsorBannerProps) {
  const { data: sponsors = [] } = useTournamentSponsors(tournamentId);

  if (sponsors.length === 0) return null;

  return (
    <div className="w-full border-b border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold whitespace-nowrap flex-shrink-0">
            Partners
          </span>
          <div className="flex items-center gap-6">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url || "#"}
                target={sponsor.website_url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                title={sponsor.name}
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-7 md:h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap px-3 py-1 rounded-full bg-muted">
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
