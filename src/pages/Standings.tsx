import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTeams, useTournaments } from "@/hooks/useSupabaseData";
import { Trophy, Info, ArrowUpDown, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const standingsRules = [
  { title: "Points System", description: "Win = 3 points, Draw = 1 point, Loss = 0 points" },
  { title: "Tiebreaker 1", description: "Goal difference (Goals For - Goals Against)" },
  { title: "Tiebreaker 2", description: "Goals scored (higher is better)" },
  { title: "Tiebreaker 3", description: "Head-to-head record between tied teams" },
  { title: "Tiebreaker 4", description: "Fair play points (fewer cards = higher ranking)" },
  { title: "Final Tiebreaker", description: "Playoff match if still tied after all criteria" }
];

const promotionCriteria = [
  { zone: "Championship Zone", positions: "1st Place", description: "Crowned league champions", color: "bg-yellow-500" },
  { zone: "Promotion Zone", positions: "2nd - 4th Place", description: "Qualified for higher division next season", color: "bg-green-500" },
  { zone: "Mid-Table", positions: "5th - 10th Place", description: "Remain in current division", color: "bg-blue-500" },
  { zone: "Relegation Zone", positions: "Bottom 3", description: "Relegated to lower division", color: "bg-red-500" }
];

const tournamentFormats = [
  {
    name: "League Format",
    description: "Every team plays each other twice (home and away). The team with the most points at the end wins.",
    matchCount: "14+ matches per team",
    duration: "4-6 months"
  },
  {
    name: "Knockout Cup",
    description: "Single-elimination tournament. Win and advance, lose and go home. Exciting sudden-death format.",
    matchCount: "Variable (3-5 matches to win)",
    duration: "1-2 months"
  },
  {
    name: "Group Stage + Playoffs",
    description: "Teams divided into groups, play round-robin within groups. Top teams advance to knockout playoffs.",
    matchCount: "6-10 matches per team",
    duration: "2-3 months"
  }
];

export default function StandingsPage() {
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const { data: allTeams = [], isLoading } = useTeams();
  const { data: tournaments = [], isLoading: tournamentsLoading } = useTournaments();

  // Filter teams by selected tournament
  const filteredTeams = selectedTournament === "all" 
    ? allTeams 
    : allTeams.filter(team => team.tournament_id === selectedTournament);

  const sortedTeams = [...filteredTeams].sort((a, b) => (b.points || 0) - (a.points || 0));

  const selectedTournamentName = selectedTournament === "all" 
    ? "All Leagues" 
    : tournaments.find(t => t.id === selectedTournament)?.name || "League";

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-12 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4">
            <EYLLogo size={50} withGlow />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Youth <span className="text-primary">Competitions</span>
              </h1>
              <p className="text-muted-foreground">League standings, tournament formats, and competition rules</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="glass-card p-1 mb-8 inline-flex">
            <TabsTrigger value="standings" className="gap-2">
              <Trophy className="h-4 w-4" />
              League Standings
            </TabsTrigger>
            <TabsTrigger value="formats" className="gap-2">
              <Calendar className="h-4 w-4" />
              Tournament Formats
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Info className="h-4 w-4" />
              Rules & Criteria
            </TabsTrigger>
          </TabsList>

          {/* Standings Tab */}
          <TabsContent value="standings">
            {/* Tournament Filter */}
            <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <EYLLogo size={28} />
                <span className="font-medium">
                  {selectedTournamentName} — The race for the top four is heating up!
                </span>
              </div>
              <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select Tournament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Standings Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                      <th className="p-4 text-left">#</th>
                      <th className="p-4 text-left">Team</th>
                      <th className="p-4 text-center">P</th>
                      <th className="p-4 text-center text-green-500">W</th>
                      <th className="p-4 text-center">D</th>
                      <th className="p-4 text-center text-red-500">L</th>
                      <th className="p-4 text-center">GF</th>
                      <th className="p-4 text-center">GA</th>
                      <th className="p-4 text-center">GD</th>
                      <th className="p-4 text-center text-primary font-bold">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-border">
                          <td colSpan={10} className="p-4">
                            <div className="h-8 bg-secondary rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      sortedTeams.map((team, index) => {
                        const gd = (team.goals_for || 0) - (team.goals_against || 0);
                        const played = (team.wins || 0) + (team.draws || 0) + (team.losses || 0);
                        const isChampion = index === 0;
                        const isPromotion = index >= 1 && index <= 3;
                        const isRelegation = index >= sortedTeams.length - 3 && sortedTeams.length > 6;

                        return (
                          <tr 
                            key={team.id} 
                            className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                              isChampion 
                                ? "border-l-2 border-l-yellow-500" 
                                : isPromotion 
                                ? "border-l-2 border-l-green-500" 
                                : isRelegation 
                                ? "border-l-2 border-l-red-500" 
                                : ""
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{index + 1}</span>
                                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                              </div>
                            </td>
                            <td className="p-4">
                              <Link to={`/clubs/${team.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                  {team.short_name || team.name.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium">{team.name}</span>
                              </Link>
                            </td>
                            <td className="p-4 text-center">{played}</td>
                            <td className="p-4 text-center text-green-500 font-medium">{team.wins || 0}</td>
                            <td className="p-4 text-center">{team.draws || 0}</td>
                            <td className="p-4 text-center text-red-500 font-medium">{team.losses || 0}</td>
                            <td className="p-4 text-center">{team.goals_for || 0}</td>
                            <td className="p-4 text-center">{team.goals_against || 0}</td>
                            <td className="p-4 text-center">
                              <span className={gd > 0 ? "text-green-500" : gd < 0 ? "text-red-500" : ""}>
                                {gd > 0 ? `+${gd}` : gd}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-lg font-bold text-primary">{team.points || 0}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="glass-card p-4 mt-4">
              <div className="flex flex-wrap gap-6 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" /> Champions
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" /> Promotion Zone
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" /> Relegation Zone
                </span>
              </div>
              <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                <span><strong>P</strong> Matches played</span>
                <span><strong className="text-green-500">W</strong> Wins (3 pts each)</span>
                <span><strong>D</strong> Draws (1 pt each)</span>
                <span><strong className="text-red-500">L</strong> Losses (0 pts)</span>
                <span><strong>GD</strong> Goal difference</span>
              </div>
            </div>
          </TabsContent>

          {/* Tournament Formats Tab */}
          <TabsContent value="formats">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {tournamentFormats.map((format, index) => (
                <div 
                  key={format.name}
                  className="glass-card p-6 hover:border-primary/50 transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{format.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{format.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Matches:</span>
                      <span className="font-medium">{format.matchCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{format.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tournament Brackets Info */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                How Brackets Work
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Seeding</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Teams are seeded based on their previous season performance and current league position. 
                    Higher seeds face lower seeds in early rounds to reward consistent performance.
                  </p>
                  <h4 className="font-semibold mb-2">Draw Process</h4>
                  <p className="text-sm text-muted-foreground">
                    The draw for knockout stages is conducted live with representatives from participating clubs. 
                    Teams from the same group cannot meet until the semi-finals.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Match Scheduling</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fixtures are scheduled at least 2 weeks in advance. Weekend matches are prioritized for 
                    player availability and spectator attendance.
                  </p>
                  <h4 className="font-semibold mb-2">Venue Selection</h4>
                  <p className="text-sm text-muted-foreground">
                    Semi-finals and finals are played at neutral venues. Earlier rounds follow home/away 
                    format or single-leg at the higher-seeded team's ground.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            {/* Standings Rules */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                League Standings Rules
              </h3>
              <div className="space-y-3">
                {standingsRules.map((rule, index) => (
                  <div 
                    key={rule.title}
                    className="p-4 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setExpandedRule(expandedRule === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium">{rule.title}</span>
                      </div>
                      {expandedRule === index ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {expandedRule === index && (
                      <p className="text-sm text-muted-foreground mt-3 ml-11">{rule.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Promotion/Relegation */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                Promotion & Relegation Criteria
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {promotionCriteria.map((zone) => (
                  <div key={zone.zone} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-3 h-3 rounded-full ${zone.color}`} />
                      <span className="font-bold">{zone.zone}</span>
                    </div>
                    <p className="text-primary text-sm font-medium mb-1">{zone.positions}</p>
                    <p className="text-xs text-muted-foreground">{zone.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-lg border border-primary/30 bg-primary/5">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Promotion and relegation only apply to 
                  multi-division tournaments. Single-division youth leagues focus on development without 
                  relegation pressure. Contact the EYL Competition Committee for specific tournament rules.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}