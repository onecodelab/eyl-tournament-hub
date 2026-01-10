import { Layout } from "@/components/layout/Layout";
import { useMatchWithTeams, useTournaments } from "@/hooks/useSupabaseData";
import { Calendar, Clock, MapPin, Users, Trophy, Info, MapPinned, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { EYLLogo } from "@/components/EYLLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
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
    description: "Round-robin competition where every team plays each other twice (home and away).",
    icon: Trophy,
    details: "Points: Win = 3pts, Draw = 1pt, Loss = 0pts. Top team wins the league."
  },
  {
    name: "Knockout Format",
    description: "Single-elimination tournament. Lose once and you're out.",
    icon: Trophy,
    details: "Used for cup competitions. Winner advances, loser is eliminated."
  },
  {
    name: "Group Stage + Knockout",
    description: "Teams play in groups first, then top teams advance to knockout rounds.",
    icon: Trophy,
    details: "Standard format for major tournaments. Combines consistency with excitement."
  }
];

const ageGroups = [
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
  "All players must be registered with their respective clubs at least 48 hours before the match",
  "Teams must arrive at the venue at least 60 minutes before kick-off",
  "Each team is allowed a maximum of 5 substitutions per match",
  "Yellow card accumulation: 3 yellows = 1 match suspension",
  "Red card = Minimum 1 match suspension, subject to disciplinary committee review",
  "Age verification may be requested at any time during the tournament",
  "Match balls, corner flags, and goal nets are provided by EYL",
  "Teams must wear distinct colors; home team has priority"
];

export default function MatchesPage() {
  const { data: matches = [], isLoading } = useMatchWithTeams();
  const { data: tournaments = [] } = useTournaments();
  const [filter, setFilter] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState<string>("all");

  const tournamentsMap = new Map(tournaments.map((t) => [t.id, t]));

  // Filter by tournament first, then by status
  const filteredMatches = useMemo(() => {
    let result = matches;
    
    // Filter by tournament
    if (selectedTournament !== "all") {
      result = result.filter(m => m.tournament_id === selectedTournament);
    }
    
    // Filter by status
    if (filter === "live") {
      result = result.filter(m => m.status === "live");
    } else if (filter === "upcoming") {
      result = result.filter(m => m.status === "scheduled");
    } else if (filter === "completed") {
      result = result.filter(m => m.status === "completed");
    }
    
    return result;
  }, [matches, selectedTournament, filter]);

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
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4">
            <EYLLogo size={50} withGlow />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Fixtures & <span className="text-primary">Results</span>
              </h1>
              <p className="text-muted-foreground">Tournament schedules, live scores, and event information</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="glass-card p-1 mb-8 inline-flex">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Match Calendar
            </TabsTrigger>
            <TabsTrigger value="formats" className="gap-2">
              <Info className="h-4 w-4" />
              Event Formats
            </TabsTrigger>
            <TabsTrigger value="venues" className="gap-2">
              <MapPinned className="h-4 w-4" />
              Venues
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Rules
            </TabsTrigger>
          </TabsList>

          {/* Match Calendar Tab */}
          <TabsContent value="calendar">
            {/* Tournament Filter */}
            <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <EYLLogo size={28} />
                <span className="font-medium">{selectedTournamentName}</span>
              </div>
              <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                <SelectTrigger className="w-[220px]">
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

            {/* Status Filter Tabs */}
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

            {/* Age Groups Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-muted-foreground mr-2">Age Groups:</span>
              {ageGroups.map((ag) => (
                <span key={ag.name} className={`px-3 py-1 rounded-full text-xs font-medium ${ag.color}`}>
                  {ag.name}
                </span>
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
                        <div className="flex items-center gap-2">
                          <EYLLogo size={24} />
                          <span className={`status-badge ${
                            isLive ? "status-live" : isCompleted ? "status-completed" : "status-upcoming"
                          }`}>
                            {isLive ? "LIVE" : isCompleted ? "FULL TIME" : "UPCOMING"}
                          </span>
                        </div>
                        {tournament && (
                          <Link 
                            to={`/tournaments/${tournament.id}`}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {tournament.name}
                          </Link>
                        )}
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

            {filteredMatches.length === 0 && !isLoading && (
              <div className="glass-card p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">
                  {selectedTournament !== "all" 
                    ? "No matches in this tournament yet. Try selecting a different tournament."
                    : "Check back later for upcoming fixtures."
                  }
                </p>
              </div>
            )}
          </TabsContent>

          {/* Event Formats Tab */}
          <TabsContent value="formats">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {eventFormats.map((fmt, index) => (
                <div 
                  key={fmt.name}
                  className="glass-card p-6 hover:border-primary/50 transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <fmt.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{fmt.name}</h3>
                  <p className="text-muted-foreground mb-4">{fmt.description}</p>
                  <p className="text-sm text-primary">{fmt.details}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Age Groups Served
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {ageGroups.map((ag) => (
                  <div key={ag.name} className="p-4 rounded-lg bg-secondary/50 text-center">
                    <div className={`text-2xl font-bold mb-1 ${ag.color.split(' ')[1]}`}>{ag.name}</div>
                    <p className="text-sm text-muted-foreground">{ag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Venues Tab */}
          <TabsContent value="venues">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue, index) => (
                <div 
                  key={venue.name}
                  className="glass-card p-6 hover:border-primary/50 transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <MapPinned className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary">{venue.type}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{venue.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{venue.location}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Capacity: {venue.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Tournament Rules & Regulations
              </h3>
              <div className="space-y-4">
                {tournamentRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
                    <span className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground pt-1">{rule}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-lg border border-primary/30 bg-primary/5">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Need the full rulebook?</strong> Contact the EYL Technical 
                  Committee at <a href="mailto:rules@ethiopianyouthleague.com" className="text-primary hover:underline">
                  rules@ethiopianyouthleague.com</a> for the complete tournament regulations document.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
