import { Layout } from "@/components/layout/Layout";
import { useMatchWithTeams, useTournaments } from "@/hooks/useSupabaseData";
import { Calendar, Clock, MapPin, Filter } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function MatchesPage() {
  const { data: matches = [], isLoading } = useMatchWithTeams();
  const { data: tournaments = [] } = useTournaments();
  const [filter, setFilter] = useState("all");

  const tournamentsMap = new Map(tournaments.map((t) => [t.id, t]));

  const filteredMatches = matches.filter((m) => {
    if (filter === "all") return true;
    if (filter === "live") return m.status === "live";
    if (filter === "upcoming") return m.status === "scheduled";
    if (filter === "completed") return m.status === "completed";
    return true;
  });

  const counts = {
    all: matches.length,
    live: matches.filter((m) => m.status === "live").length,
    upcoming: matches.filter((m) => m.status === "scheduled").length,
    completed: matches.filter((m) => m.status === "completed").length,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Live <span className="text-primary">Matches</span>
            </h1>
            <p className="text-muted-foreground">Real-time scores and match schedules—where the drama unfolds</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">All Matches</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card inline-flex p-1 mb-8">
          {[
            { key: "all", label: `All (${counts.all})` },
            { key: "live", label: `Live (${counts.live})`, dot: true },
            { key: "upcoming", label: `Coming Up (${counts.upcoming})` },
            { key: "completed", label: `Full Time (${counts.completed})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === tab.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.dot && <span className="w-2 h-2 rounded-full bg-green-500" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => {
              const isLive = match.status === "live";
              const isCompleted = match.status === "completed";
              const tournament = tournamentsMap.get(match.tournament_id || "");

              return (
                <div key={match.id} className="glass-card p-5 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`status-badge ${
                      isLive ? "status-live" : isCompleted ? "status-completed" : "status-upcoming"
                    }`}>
                      {isLive ? "LIVE" : isCompleted ? "FULL TIME" : "UPCOMING"}
                    </span>
                    <span className="text-xs text-muted-foreground">{tournament?.name}</span>
                  </div>

                  {match.tagline && (
                    <div className="text-center mb-4">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider px-2 py-1 bg-primary/10 rounded">
                        {match.tagline}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-2">
                        {match.home_team?.short_name || "HT"}
                      </div>
                      <p className="text-sm font-medium">{match.home_team?.name || "Home"}</p>
                      <p className="text-xs text-muted-foreground">Home</p>
                    </div>

                    <div className="text-center">
                      {isCompleted || isLive ? (
                        <div className="text-3xl font-bold">
                          {match.home_score ?? 0} - {match.away_score ?? 0}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-primary">VS</span>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground mx-auto mb-2">
                        {match.away_team?.short_name || "AT"}
                      </div>
                      <p className="text-sm font-medium">{match.away_team?.name || "Away"}</p>
                      <p className="text-xs text-muted-foreground">Away</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                    {match.match_date && (
                      <>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(match.match_date), "MMM d")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(match.match_date), "HH:mm")}
                        </span>
                      </>
                    )}
                    {match.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.venue}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
