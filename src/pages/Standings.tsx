import { Layout } from "@/components/layout/Layout";
import { useTeams, useTournaments } from "@/hooks/useSupabaseData";
import { Trophy } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";

export default function StandingsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const { data: tournaments = [] } = useTournaments();

  const sortedTeams = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <EYLLogo size={50} withGlow />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                League <span className="text-primary">Standings</span>
              </h1>
              <p className="text-muted-foreground">Real-time league table updated after every match</p>
            </div>
          </div>
        </div>

        {/* Tournament Banner */}
        <div className="glass-card p-4 mb-6 flex items-center gap-3">
          <EYLLogo size={28} />
          <span className="font-medium">
            {tournaments[0]?.name || "U-17 Addis Premier"} — The race for the top four is heating up!
          </span>
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
                    const isTop4 = index < 4;

                    return (
                      <tr 
                        key={team.id} 
                        className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                          isTop4 ? "border-l-2 border-l-primary" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{index + 1}</span>
                            {index === 0 && <Trophy className="h-4 w-4 text-primary" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {team.short_name || team.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{team.name}</span>
                          </div>
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
        <div className="glass-card p-4 mt-4 flex flex-wrap gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" /> Top 4 — Champions League spots
          </span>
          <span><strong>P</strong> Matches played</span>
          <span><strong className="text-green-500">W</strong> Wins (3 pts each)</span>
          <span><strong>D</strong> Draws (1 pt each)</span>
          <span><strong className="text-red-500">L</strong> Losses (0 pts)</span>
          <span><strong>GD</strong> Goal difference</span>
        </div>
      </div>
    </Layout>
  );
}
