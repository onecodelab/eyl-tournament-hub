import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTournaments } from "@/hooks/useSupabaseData";
import { Trophy, Calendar, Users, ArrowRight, Info, FileText, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const { data: tournaments = [], isLoading } = useTournaments();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">LIVE</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">UPCOMING</Badge>;
      case 'completed':
        return <Badge className="bg-muted text-muted-foreground">COMPLETED</Badge>;
      default:
        return null;
    }
  };

  const getFormatBadge = (format: string | null) => {
    switch (format) {
      case 'league':
        return <Badge variant="outline" className="text-xs">League</Badge>;
      case 'knockout':
        return <Badge variant="outline" className="text-xs">Knockout</Badge>;
      case 'group_knockout':
        return <Badge variant="outline" className="text-xs">Group + Knockout</Badge>;
      default:
        return null;
    }
  };

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
              <p className="text-muted-foreground">Browse tournaments, view standings, and explore competition details</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tournaments" className="w-full">
          <TabsList className="glass-card p-1 mb-8 inline-flex">
            <TabsTrigger value="tournaments" className="gap-2">
              <Trophy className="h-4 w-4" />
              Tournaments
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

          {/* Tournaments Tab */}
          <TabsContent value="tournaments">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Select a tournament to view standings, fixtures, and statistics
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-48 animate-pulse" />
                ))}
              </div>
            ) : tournaments.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Tournaments</h3>
                <p className="text-muted-foreground">Check back soon for upcoming competitions.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                  <Link 
                    key={tournament.id} 
                    to={`/tournaments/${tournament.id}`}
                    className="glass-card p-6 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {tournament.logo_url ? (
                          <img 
                            src={tournament.logo_url} 
                            alt={tournament.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        {getStatusBadge(tournament.status)}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {tournament.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {tournament.age_category && (
                        <Badge variant="outline" className="text-xs">
                          {tournament.age_category.toUpperCase()}
                        </Badge>
                      )}
                      {getFormatBadge(tournament.format)}
                    </div>

                    {tournament.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {tournament.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                      {tournament.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tournament.start_date), "MMM d, yyyy")}
                        </span>
                      )}
                      {tournament.max_teams && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tournament.max_teams} teams
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
                  multi-division tournaments. Single-division tournaments crown a champion without relegation.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
