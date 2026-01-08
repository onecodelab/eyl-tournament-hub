import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { useMatchWithTeams, useTournaments } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

export function UpcomingMatches() {
  const { data: matches = [], isLoading } = useMatchWithTeams();
  const { data: tournaments = [] } = useTournaments();

  const tournamentsMap = new Map(tournaments.map((t) => [t.id, t]));

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">
          Upcoming <span className="section-title-accent">Matches</span>
        </h2>
        <Link 
          to="/matches"
          className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
        >
          Full Schedule
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="glass-card min-w-[280px] p-4 animate-pulse">
              <div className="h-6 w-20 bg-secondary rounded mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-secondary rounded-full" />
                <div className="h-8 w-16 bg-secondary rounded" />
                <div className="h-10 w-10 bg-secondary rounded-full" />
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
                className="glass-card min-w-[280px] p-4 hover:border-primary/50 transition-all flex-shrink-0"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
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
                  <span className="text-xs text-muted-foreground">
                    {tournament?.name || "Tournament"}
                  </span>
                </div>

                {/* Match Tagline */}
                {match.tagline && (
                  <div className="text-center mb-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider px-2 py-0.5 bg-primary/10 rounded">
                      {match.tagline}
                    </span>
                  </div>
                )}

                {/* Teams & Score */}
                <div className="flex items-center justify-between mb-4">
                  {/* Home Team */}
                  <div className="flex flex-col items-center text-center min-w-[80px]">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary mb-1">
                      {match.home_team?.short_name || "HT"}
                    </div>
                    <span className="text-xs font-medium text-foreground">{match.home_team?.name || "Home"}</span>
                    <span className="text-[10px] text-muted-foreground">Home</span>
                  </div>

                  {/* Score / VS */}
                  <div className="text-center">
                    {isCompleted || isLive ? (
                      <div className="text-2xl font-bold text-foreground">
                        {match.home_score ?? 0} - {match.away_score ?? 0}
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">VS</span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center text-center min-w-[80px]">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground mb-1">
                      {match.away_team?.short_name || "AT"}
                    </div>
                    <span className="text-xs font-medium text-foreground">{match.away_team?.name || "Away"}</span>
                    <span className="text-[10px] text-muted-foreground">Away</span>
                  </div>
                </div>

                {/* Date/Time/Venue */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                  {match.match_date && (
                    <>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(match.match_date), "MMM d")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(match.match_date), "HH:mm")}</span>
                      </div>
                    </>
                  )}
                  {match.venue && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[80px]">{match.venue}</span>
                    </div>
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
