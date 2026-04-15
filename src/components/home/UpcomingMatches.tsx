import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { useMatchWithTeams, useTournaments } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

export function UpcomingMatches() {
  const { data: matches = [], isLoading } = useMatchWithTeams();
  const { data: tournaments = [] } = useTournaments();

  const tournamentsMap = new Map(tournaments.map((t) => [t.id, t]));

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">
          Upcoming <span className="section-title-accent">Matches</span>
        </h2>
        <Link 
          to="/matches"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors touch-target"
        >
          Full Schedule
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="scroll-container">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="glass-card min-w-[260px] p-4 animate-pulse flex-shrink-0">
              <div className="h-5 w-16 bg-secondary rounded mb-3" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 bg-secondary rounded-full" />
                <div className="h-6 w-14 bg-secondary rounded" />
                <div className="h-8 w-8 bg-secondary rounded-full" />
              </div>
              <div className="h-3 w-full bg-secondary rounded" />
            </div>
          ))
        ) : (
          matches.slice(0, 6).map((match) => {
            const isLive = match.status === "live";
            const isCompleted = match.status === "completed";
            const tournament = tournamentsMap.get(match.tournament_id || "");

            return (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className={`glass-card min-w-[260px] p-3 transition-all flex-shrink-0 border-transparent hover:border-primary/50 group ${isLive ? 'live-card-pulse' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    {isLive ? (
                      <span className="live-badge flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        67'
                      </span>
                    ) : (
                      <span className="status-badge status-upcoming">UPCOMING</span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                    {tournament?.name || "Tournament"}
                  </span>
                </div>

                {/* Match Tagline */}
                {match.tagline && (
                  <div className="text-center mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 bg-primary/10 rounded">
                      {match.tagline}
                    </span>
                  </div>
                )}

                {/* Teams & Score - Grid Layout */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-2">
                  {/* Home Team */}
                      <div className="flex-shrink-0 text-center">
                        {match.home_team?.logo_url ? (
                          <div className="flex items-center justify-center h-16 w-16 mx-auto mb-1">
                            <img src={match.home_team.logo_url} className="w-16 h-16 object-contain scale-125 drop-shadow-md" alt="Home" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mb-1 mx-auto">
                            {match.home_team?.short_name || 'HT'}
                          </div>
                        )}
                        <p className="text-[10px] uppercase tracking-wider font-bold text-foreground/80 truncate w-20 mx-auto">{match.home_team?.name}</p>
                      </div>

                  {/* Score / VS */}
                  <div className="text-center">
                    {isCompleted || isLive ? (
                      <div className="match-score text-lg">
                        {match.home_score ?? 0} - {match.away_score ?? 0}
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">VS</span>
                    )}
                  </div>

                  {/* Away Team */}
                      <div className="flex-shrink-0 text-center">
                        {match.away_team?.logo_url ? (
                          <div className="flex items-center justify-center h-16 w-16 mx-auto mb-1">
                            <img src={match.away_team.logo_url} className="w-16 h-16 object-contain scale-125 drop-shadow-md" alt="Away" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground mb-1 mx-auto">
                            {match.away_team?.short_name || 'AT'}
                          </div>
                        )}
                        <p className="text-[10px] uppercase tracking-wider font-bold text-foreground/80 truncate w-20 mx-auto">{match.away_team?.name}</p>
                      </div>
                </div>

                {/* Date/Time/Venue - Footer */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-2">
                  {match.match_date && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {format(new Date(match.match_date), "MMM d")}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {format(new Date(match.match_date), "HH:mm")}
                      </span>
                    </div>
                  )}
                  {match.venue && (
                    <span className="flex items-center gap-0.5 truncate max-w-[70px]">
                      <MapPin className="h-2.5 w-2.5" strokeWidth={1.5} />
                      {match.venue}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
