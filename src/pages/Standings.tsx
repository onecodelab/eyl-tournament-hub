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
        return (
          <span className="absolute top-3 right-3 status-badge status-live">
            LIVE
          </span>
        );
      case 'upcoming':
        return (
          <span className="absolute top-3 right-3 status-badge status-upcoming">
            UPCOMING
          </span>
        );
      case 'completed':
        return (
          <span className="absolute top-3 right-3 status-badge status-completed">
            COMPLETED
          </span>
        );
      default:
        return null;
    }
  };

  const getFormatBadge = (format: string | null) => {
    switch (format) {
      case 'league':
        return <Badge variant="outline" className="text-[11px] px-2 py-0.5">League</Badge>;
      case 'knockout':
        return <Badge variant="outline" className="text-[11px] px-2 py-0.5">Knockout</Badge>;
      case 'group_knockout':
        return <Badge variant="outline" className="text-[11px] px-2 py-0.5">Group + Knockout</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Hero - Elite Competition Hub */}
      <section className="relative py-12 overflow-hidden border-b border-white/5 bg-eyl-navy">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4">
            <EYLLogo size={48} withGlow />
            <div>
              <div className="data-precision-mono text-primary font-bold tracking-widest mb-1">OFFICIAL COMPETITIONS</div>
              <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                Youth <span className="text-primary">Competitions</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="tournaments" className="w-full">
          {/* Horizontal Scroll Tabs */}
          <div className="scroll-container mb-6">
            <TabsList className="glass-card p-1 inline-flex gap-1">
              <TabsTrigger value="tournaments" className="gap-2 text-sm">
                <Trophy className="h-4 w-4" strokeWidth={1.5} />
                Tournaments
              </TabsTrigger>
              <TabsTrigger value="formats" className="gap-2 text-sm">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                Formats
              </TabsTrigger>
              <TabsTrigger value="rules" className="gap-2 text-sm">
                <Info className="h-4 w-4" strokeWidth={1.5} />
                Rules
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments">
            <p className="text-sm text-muted-foreground mb-4">
              Select a tournament to view standings and statistics
            </p>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-[110px] animate-pulse" />
                ))}
              </div>
            ) : tournaments.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="font-semibold text-sm mb-1">No Tournaments</h3>
                <p className="text-xs text-muted-foreground">Check back soon for upcoming competitions.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournaments.map((tournament) => (
                  <Link 
                    key={tournament.id} 
                    to={`/tournaments/${tournament.id}`}
                    className="relative glass-card-hover p-4 group min-h-[110px]"
                  >
                    {getStatusBadge(tournament.status)}
                    
                    <div className="flex items-start gap-3 mb-3">
                      {tournament.logo_url ? (
                        <img 
                          src={tournament.logo_url} 
                          alt={tournament.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[15px] leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {tournament.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {tournament.age_category && (
                            <span className="text-[11px] text-muted-foreground">
                              {tournament.age_category.toUpperCase()}
                            </span>
                          )}
                          {tournament.format && (
                            <>
                              <span className="text-muted-foreground/50">•</span>
                              {getFormatBadge(tournament.format)}
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" strokeWidth={1.5} />
                    </div>

                    {tournament.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {tournament.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                      {tournament.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" strokeWidth={1.5} />
                          {format(new Date(tournament.start_date), "MMM d, yyyy")}
                        </span>
                      )}
                      {tournament.max_teams && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" strokeWidth={1.5} />
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
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {tournamentFormats.map((format, index) => (
                <div 
                  key={format.name}
                  className="glass-card p-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Trophy className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold mb-1">{format.name}</h3>
                  <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{format.description}</p>
                  <div className="space-y-1 text-xs">
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
            <div className="glass-card p-4">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-primary" strokeWidth={1.5} />
                How Brackets Work
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Seeding</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Teams are seeded based on their previous season performance and current league position. 
                    Higher seeds face lower seeds in early rounds.
                  </p>
                  <h4 className="font-semibold text-sm mb-1">Draw Process</h4>
                  <p className="text-xs text-muted-foreground">
                    The draw for knockout stages is conducted live with club representatives. 
                    Teams from the same group cannot meet until semi-finals.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Match Scheduling</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Fixtures are scheduled at least 2 weeks in advance. Weekend matches are prioritized.
                  </p>
                  <h4 className="font-semibold text-sm mb-1">Venue Selection</h4>
                  <p className="text-xs text-muted-foreground">
                    Semi-finals and finals are played at neutral venues. Earlier rounds follow home/away format.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            {/* Standings Rules */}
            <div className="glass-card p-4 mb-4">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" strokeWidth={1.5} />
                League Standings Rules
              </h3>
              <div className="space-y-2">
                {standingsRules.map((rule, index) => (
                  <div 
                    key={rule.title}
                    className="p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors touch-target"
                    onClick={() => setExpandedRule(expandedRule === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{rule.title}</span>
                      </div>
                      {expandedRule === index ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      )}
                    </div>
                    {expandedRule === index && (
                      <p className="text-xs text-muted-foreground mt-2 ml-8">{rule.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Promotion/Relegation */}
            <div className="glass-card p-4">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-primary" strokeWidth={1.5} />
                Promotion & Relegation
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {promotionCriteria.map((zone) => (
                  <div key={zone.zone} className="p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${zone.color}`} />
                      <span className="font-bold text-xs">{zone.zone}</span>
                    </div>
                    <p className="text-primary text-xs font-medium mb-0.5">{zone.positions}</p>
                    <p className="text-[11px] text-muted-foreground">{zone.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Promotion and relegation only apply to 
                  multi-division tournaments.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
