import { Layout } from "@/components/layout/Layout";
import { useMatchWithTeams, useTournaments } from "@/hooks/useSupabaseData";
import { Calendar, Clock, MapPin, Users, Trophy, Info, MapPinned, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { EYLLogo } from "@/components/EYLLogo";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

  const normalizeTournamentName = (name: string) => {
    return name.replace(/(?:\b|\s)[uU]\s*-?\s*\d+\b.*$/i, '').trim() || name;
  };

  const groupedTournaments = useMemo(() => {
    const groups = new Map<string, { id: string; name: string; ids: string[] }>();
    tournaments.forEach(t => {
      const normName = normalizeTournamentName(t.name);
      if (!groups.has(normName)) {
        groups.set(normName, { id: normName, name: normName, ids: [] });
      }
      groups.get(normName)!.ids.push(t.id);
    });
    return Array.from(groups.values());
  }, [tournaments]);

  const filteredMatches = useMemo(() => {
    let result = matches;
    
    if (selectedTournament !== "all") {
      const selectedGroup = groupedTournaments.find(g => g.id === selectedTournament);
      if (selectedGroup) {
        result = result.filter(m => m.tournament_id && selectedGroup.ids.includes(m.tournament_id));
      }
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
      : matches.filter(m => {
          const selectedGroup = groupedTournaments.find(g => g.id === selectedTournament);
          return m.tournament_id && selectedGroup?.ids.includes(m.tournament_id);
        });
    
    return {
      all: tournamentMatches.length,
      live: tournamentMatches.filter((m) => m.status === "live").length,
      upcoming: tournamentMatches.filter((m) => m.status === "scheduled").length,
      completed: tournamentMatches.filter((m) => m.status === "completed").length,
    };
  }, [matches, selectedTournament, groupedTournaments]);

  const selectedTournamentName = selectedTournament === "all" 
    ? "All Tournaments" 
    : groupedTournaments.find(g => g.id === selectedTournament)?.name || "Tournament";

  return (
    <Layout>
      {/* Hero - Elite Fixtures */}
      <section className="relative py-6 md:py-8 overflow-hidden bg-eyl-navy border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.2),transparent_60%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:block"><EYLLogo size={48} withGlow /></div>
            <div className="md:hidden"><EYLLogo size={36} withGlow /></div>
            <div>
              <div className="data-precision-mono text-primary font-bold tracking-widest text-[10px] md:text-xs mb-0.5 md:mb-1">MATCH CENTRE</div>
              <h1 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                Fixtures & <span className="text-primary">Results</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="w-full">
            {/* Filter Bar */}
            <div className="glass-card p-2 sm:p-3 mb-6 flex flex-row items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                <EYLLogo size={24} className="flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm whitespace-nowrap truncate">{selectedTournamentName}</span>
              </div>
              
              <div className="flex flex-row items-center justify-end gap-2 w-full md:w-auto">
                {/* Expandable Search */}
                <div className={`relative transition-all duration-300 overflow-hidden group border rounded-md flex-shrink-0 ${
                    searchQuery 
                      ? 'w-[140px] sm:w-[200px] md:w-[250px] border-border/50 bg-card' 
                      : 'w-9 border-transparent hover:border-border/50 focus-within:border-primary/50 bg-transparent hover:bg-card focus-within:bg-card'
                  }`}>
                  <div className="absolute left-0 top-0 h-9 w-9 flex items-center justify-center pointer-events-none text-muted-foreground group-focus-within:text-primary">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input 
                    placeholder="Search games by name..." 
                    className="pl-9 h-9 border-none bg-transparent shadow-none focus-visible:ring-0 w-full placeholder:text-transparent focus-within:placeholder:text-muted-foreground sm:group-hover:placeholder:text-muted-foreground focus:placeholder:opacity-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Invisible active element on desktop that forces expansion on hover via CSS child */}
                  {!searchQuery && (
                    <div className="hidden sm:block absolute inset-0 cursor-pointer peer" onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input) input.focus();
                    }}></div>
                  )}
                </div>
                <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                  <SelectTrigger className="w-[140px] sm:w-[200px] h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Tournaments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tournaments</SelectItem>
                    {groupedTournaments.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    <div key={match.id} className="glass-card p-3 md:p-4 hover:border-primary/50 transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
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
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-2">
                        {/* Home Team */}
                        <div className="flex-shrink-0 text-center">
                          {match.home_team?.logo_url ? (
                            <div className="flex items-center justify-center h-16 w-16 mx-auto mb-1">
                              <img src={match.home_team.logo_url} className="w-16 h-16 object-contain scale-125 drop-shadow-md" alt={match.home_team.name} />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mx-auto mb-1">
                              {match.home_team?.short_name || 'HT'}
                            </div>
                          )}
                        <p className="text-[10px] uppercase tracking-wider font-bold text-foreground/80 truncate w-20 mx-auto">{match.home_team?.name}</p>
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
                        <div className="flex-shrink-0 text-center">
                          {match.away_team?.logo_url ? (
                            <div className="flex items-center justify-center h-16 w-16 mx-auto mb-1">
                              <img src={match.away_team.logo_url} className="w-16 h-16 object-contain scale-125 drop-shadow-md" alt={match.away_team.name} />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground mx-auto mb-1">
                              {match.away_team?.short_name || 'AT'}
                            </div>
                          )}
                        <p className="text-[10px] uppercase tracking-wider font-bold text-foreground/80 truncate w-20 mx-auto">{match.away_team?.name}</p>
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
        </div>
      </div>
    </Layout>
  );
}
