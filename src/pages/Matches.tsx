import { Layout } from "@/components/layout/Layout";
import { useMatchWithTeams, useTournaments } from "@/hooks/useSupabaseData";
import { Calendar, Clock, MapPin, Users, Trophy, Info, MapPinned, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { EYLLogo } from "@/components/EYLLogo";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventFormats = [
  {
    name: "League Format",
    description: "Round-robin competition where every team plays each other twice.",
    icon: Trophy,
    details: "Points: Win = 3pts, Draw = 1pt, Loss = 0pts."
  },
  {
    name: "Knockout Format",
    description: "Single-elimination tournament. Lose once and you're out.",
    icon: Trophy,
    details: "Used for cup competitions."
  },
  {
    name: "Group + Knockout",
    description: "Teams play in groups first, top teams advance to knockouts.",
    icon: Trophy,
    details: "Standard format for major tournaments."
  }
];

function PenaltyResult({ matchId }: { matchId: string }) {
  const { data } = useQuery({
    queryKey: ["penalty-result", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_events")
        .select("details")
        .eq("match_id", matchId)
        .eq("event_type", "penalty_shootout")
        .maybeSingle();
      if (error) throw error;
      return data?.details as { home_penalties?: number; away_penalties?: number } | null;
    },
  });

  if (!data) return null;
  return (
    <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
      Pen: {data.home_penalties ?? 0} - {data.away_penalties ?? 0}
    </div>
  );
}


  { name: "U-12", description: "Under 12 years", color: "bg-green-500/10 text-green-500" },
  { name: "U-14", description: "Under 14 years", color: "bg-blue-500/10 text-blue-500" },
  { name: "U-17", description: "Under 17 years", color: "bg-purple-500/10 text-purple-500" },
  { name: "U-20", description: "Under 20 years", color: "bg-primary/10 text-primary" }
];

const venues = [
  { name: "Addis Ababa Stadium", location: "Addis Ababa", capacity: "35,000", type: "Main Venue" },
  { name: "Dire Dawa Stadium", location: "Dire Dawa", capacity: "15,000", type: "Regional" },
  { name: "Hawassa City Stadium", location: "Hawassa", capacity: "20,000", type: "Regional" },
  { name: "Bahir Dar Stadium", location: "Bahir Dar", capacity: "18,000", type: "Regional" },
  { name: "Mekelle Stadium", location: "Mekelle", capacity: "12,000", type: "Regional" }
];

const tournamentRules = [
  "All players must be registered at least 48 hours before the match",
  "Teams must arrive at the venue 60 minutes before kick-off",
  "Each team is allowed 5 substitutions per match",
  "3 yellow cards = 1 match suspension",
  "Red card = Minimum 1 match suspension",
  "Age verification may be requested at any time",
  "Teams must wear distinct colors; home team has priority"
];

export default function MatchesPage() {
  const { data: matches = [], isLoading } = useMatchWithTeams();
  const { data: tournaments = [] } = useTournaments();
  const [filter, setFilter] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tournamentsMap = new Map(tournaments.map((t) => [t.id, t]));

  const filteredMatches = useMemo(() => {
    let result = matches;
    
    if (selectedTournament !== "all") {
      result = result.filter(m => m.tournament_id === selectedTournament);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.home_team?.name.toLowerCase().includes(query) ||
        m.away_team?.name.toLowerCase().includes(query) ||
        (m.venue && m.venue.toLowerCase().includes(query)) ||
        (m.tagline && m.tagline.toLowerCase().includes(query))
      );
    }
    
    if (filter === "live") {
      result = result.filter(m => m.status === "live");
    } else if (filter === "upcoming") {
      result = result.filter(m => m.status === "scheduled");
    } else if (filter === "completed") {
      result = result.filter(m => m.status === "completed");
    }
    
    return result;
  }, [matches, selectedTournament, filter, searchQuery]);

  const counts = useMemo(() => {
    const tournamentMatches = selectedTournament === "all" 
      ? matches 
      : matches.filter(m => m.tournament_id === selectedTournament);
    
    return {
      all: tournamentMatches.length,
      live: tournamentMatches.filter((m) => m.status === "live").length,
      upcoming: tournamentMatches.filter((m) => m.status === "scheduled").length,
      completed: tournamentMatches.filter((m) => m.status === "completed").length,
    };
  }, [matches, selectedTournament]);

  const selectedTournamentName = selectedTournament === "all" 
    ? "All Tournaments" 
    : tournaments.find(t => t.id === selectedTournament)?.name || "Tournament";

  return (
    <Layout>
      {/* Hero - Compact */}
      <section className="relative py-8 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-3">
            <EYLLogo size={40} withGlow />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Fixtures & <span className="text-primary">Results</span>
              </h1>
              <p className="text-sm text-muted-foreground">Tournament schedules and live scores</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="calendar" className="w-full">
          {/* Horizontal Scroll Tabs */}
          <div className="scroll-container mb-6">
            <TabsList className="glass-card p-1 inline-flex gap-1">
              <TabsTrigger value="calendar" className="gap-2 text-sm">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="formats" className="gap-2 text-sm">
                <Info className="h-4 w-4" strokeWidth={1.5} />
                Formats
              </TabsTrigger>
              <TabsTrigger value="venues" className="gap-2 text-sm">
                <MapPinned className="h-4 w-4" strokeWidth={1.5} />
                Venues
              </TabsTrigger>
              <TabsTrigger value="rules" className="gap-2 text-sm">
                <ClipboardList className="h-4 w-4" strokeWidth={1.5} />
                Rules
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Match Calendar Tab */}
          <TabsContent value="calendar">
            {/* Tournament Filter */}
            <div className="glass-card p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <EYLLogo size={24} />
                <span className="font-medium text-sm">{selectedTournamentName}</span>
              </div>
              <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                <SelectTrigger className="w-[200px] h-9 text-sm">
                  <SelectValue placeholder="Select Tournament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tournaments</SelectItem>
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Keyword Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search games by team, venue or event details..." 
                className="pl-10 h-11 bg-card border-border/50 focus:border-primary/50 transition-all rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter Pills - Horizontal Scroll */}
            <div className="scroll-container mb-4">
              {[
                { key: "all", label: `All (${counts.all})` },
                { key: "live", label: `Live (${counts.live})`, dot: true },
                { key: "upcoming", label: `Upcoming (${counts.upcoming})` },
                { key: "completed", label: `Full Time (${counts.completed})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={filter === tab.key ? "pill-tab-active" : "pill-tab-inactive"}
                >
                  {tab.dot && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block" />}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Age Groups Pills - Horizontal Scroll */}
            <div className="scroll-container mb-4">
              <span className="text-xs text-muted-foreground mr-2 whitespace-nowrap">Age Groups:</span>
              {ageGroups.map((ag) => (
                <span key={ag.name} className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${ag.color}`}>
                  {ag.name}
                </span>
              ))}
            </div>

            {/* Matches Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-36 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMatches.map((match) => {
                  const isLive = match.status === "live";
                  const isCompleted = match.status === "completed";
                  const tournament = tournamentsMap.get(match.tournament_id || "");

                  return (
                    <div key={match.id} className="glass-card p-4 hover:border-primary/50 transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`status-badge ${
                          isLive ? "status-live" : isCompleted ? "status-completed" : "status-upcoming"
                        }`}>
                          {isLive ? "LIVE" : isCompleted ? "FT" : "SOON"}
                        </span>
                        {tournament && (
                          <Link 
                            to={`/tournaments/${tournament.id}`}
                            className="text-[11px] text-muted-foreground hover:text-primary transition-colors truncate max-w-[100px]"
                          >
                            {tournament.name}
                          </Link>
                        )}
                      </div>

                      {/* Tagline */}
                      {match.tagline && (
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 bg-primary/10 rounded">
                            {match.tagline}
                          </span>
                        </div>
                      )}

                      {/* Match Grid Layout */}
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-3">
                        {/* Home Team */}
                        <div className="text-center">
                          <div className="team-logo-md bg-primary/20 text-primary mx-auto mb-1">
                            {match.home_team?.short_name || "HT"}
                          </div>
                          <p className="text-[13px] font-medium truncate">{match.home_team?.name || "Home"}</p>
                        </div>

                        {/* Score */}
                        <div className="text-center">
                          {isCompleted || isLive ? (
                            <>
                              <div className="match-score">
                                {match.home_score ?? 0} - {match.away_score ?? 0}
                              </div>
                              {isCompleted && match.stage && match.stage !== "group" && match.home_score === match.away_score && (
                                <PenaltyResult matchId={match.id} />
                              )}
                            </>
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">VS</span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="text-center">
                          <div className="team-logo-md bg-secondary text-muted-foreground mx-auto mb-1">
                            {match.away_team?.short_name || "AT"}
                          </div>
                          <p className="text-[13px] font-medium truncate">{match.away_team?.name || "Away"}</p>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-2 mt-2">
                        {match.match_date && (
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" strokeWidth={1.5} />
                              {format(new Date(match.match_date), "MMM d")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" strokeWidth={1.5} />
                              {format(new Date(match.match_date), "HH:mm")}
                            </span>
                          </div>
                        )}
                        {match.venue && (
                          <span className="flex items-center gap-1 truncate max-w-[80px]">
                            <MapPin className="h-3 w-3" strokeWidth={1.5} />
                            {match.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredMatches.length === 0 && !isLoading && (
              <div className="glass-card p-10 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="font-semibold text-sm mb-1">No matches found</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedTournament !== "all" 
                    ? "No matches in this tournament yet."
                    : "Check back later for upcoming fixtures."
                  }
                </p>
              </div>
            )}
          </TabsContent>

          {/* Event Formats Tab */}
          <TabsContent value="formats">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {eventFormats.map((fmt, index) => (
                <div 
                  key={fmt.name}
                  className="glass-card p-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <fmt.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold mb-1">{fmt.name}</h3>
                  <p className="text-muted-foreground text-xs mb-2">{fmt.description}</p>
                  <p className="text-xs text-primary">{fmt.details}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" strokeWidth={1.5} />
                Age Groups Served
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {ageGroups.map((ag) => (
                  <div key={ag.name} className="p-3 rounded-lg bg-secondary/50 text-center">
                    <div className={`text-lg font-bold mb-0.5 ${ag.color.split(' ')[1]}`}>{ag.name}</div>
                    <p className="text-xs text-muted-foreground">{ag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Venues Tab */}
          <TabsContent value="venues">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue, index) => (
                <div 
                  key={venue.name}
                  className="glass-card p-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <MapPinned className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{venue.type}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-0.5">{venue.name}</h3>
                  <p className="text-muted-foreground text-xs mb-2">{venue.location}</p>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Users className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-muted-foreground">Capacity: {venue.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <div className="glass-card p-4">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.5} />
                Tournament Rules
              </h3>
              <div className="space-y-2">
                {tournamentRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-xs text-muted-foreground pt-1">{rule}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Full regulations</strong> are available in the official EYL Rulebook. 
                  Contact the league office for a complete copy.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
