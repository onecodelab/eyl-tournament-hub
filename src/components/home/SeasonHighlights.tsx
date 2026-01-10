import { ArrowRight, Trophy, Target, Shield, Goal } from "lucide-react";
import { usePlayers, useTeams, useAllMatches } from "@/hooks/useSupabaseData";
import { Link } from "react-router-dom";
import { EYLLogo } from "@/components/EYLLogo";
export function SeasonHighlights() {
  const {
    data: players = []
  } = usePlayers({
    limit: 5
  });
  const {
    data: teams = []
  } = useTeams();
  const {
    data: matches = []
  } = useAllMatches();
  const topScorers = players.slice(0, 5);
  const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
  const completedMatches = matches.filter(m => m.status === "completed").length;

  // Best defense - least goals against
  const bestDefense = teams.length > 0 ? [...teams].sort((a, b) => (a.goals_against || 0) - (b.goals_against || 0))[0] : null;

  // Champion - most points
  const champion = teams.length > 0 ? [...teams].sort((a, b) => (b.points || 0) - (a.points || 0))[0] : null;

  // Featured match (most recent completed)
  const featuredMatch = matches.find(m => m.status === "completed");
  return <section className="container mx-auto px-4 py-8">
      <h2 className="section-title mb-6">
        Season <span className="section-title-accent">Highlights</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Golden Boot */}
        <div className="lg:col-span-4 glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <EYLLogo size={28} />
              <h3 className="font-semibold">Golden Boot</h3>
            </div>
            <Link to="/statistics" className="text-muted-foreground hover:text-primary text-xs flex items-center gap-1">
              All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topScorers.map((player, index) => {
            const team = teams.find(t => t.id === player.team_id);
            return <div key={player.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {team?.short_name?.slice(0, 2) || "TM"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{player.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{team?.name || "Team"}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{player.goals || 0}</span>
                </div>;
          })}
          </div>
        </div>

        {/* Match of the Day + Stats */}
        <div className="lg:col-span-5 grid grid-rows-2 gap-4">
          {/* Match of the Day */}
          <div className="glass-card p-4 bg-cover bg-center relative overflow-hidden" style={{
          backgroundImage: `linear-gradient(to right, rgba(14, 27, 49, 0.95), rgba(14, 27, 49, 0.7)), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400')`
        }}>
            <div className="flex items-center gap-2 mb-2">
              <EYLLogo size={24} />
              <span className="text-xs font-bold text-primary uppercase">Match of the Day</span>
            </div>
            <h4 className="text-lg font-bold mb-1">
              {featuredMatch?.tagline || "JAN MEDA DERBY: ARADA VS ADDIS"}
            </h4>
            <p className="text-sm text-muted-foreground">
              Abenezer's hat-trick seals the victory
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Target className="h-3 w-3" />
                TOTAL GOALS
              </div>
              <div className="text-3xl font-bold text-primary">{totalGoals}</div>
              <span className="text-xs text-green-500">+15%</span>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Shield className="h-3 w-3" />
                CLEAN SHEETS
              </div>
              <div className="text-3xl font-bold text-primary">124</div>
              <span className="text-xs text-green-500">+10%</span>
            </div>
          </div>
        </div>

        {/* Right Column Stats */}
        
      </div>
    </section>;
}