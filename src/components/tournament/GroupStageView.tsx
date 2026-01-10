import { useMemo } from "react";
import { Trophy } from "lucide-react";

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  points?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goals_for?: number | null;
  goals_against?: number | null;
}

interface Match {
  id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
}

interface GroupStageViewProps {
  teams: Team[];
  matches: Match[];
  teamsMap: Map<string, Team>;
}

export function GroupStageView({ teams, matches, teamsMap }: GroupStageViewProps) {
  // For now, we'll create mock groups based on team count
  // In production, you'd have a group_id field on teams or a separate groups table
  const groups = useMemo(() => {
    const numGroups = Math.ceil(teams.length / 4);
    const groupsArray: { name: string; teams: Team[] }[] = [];
    
    for (let i = 0; i < numGroups; i++) {
      const groupTeams = teams.slice(i * 4, (i + 1) * 4);
      if (groupTeams.length > 0) {
        groupsArray.push({
          name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
          teams: [...groupTeams].sort((a, b) => (b.points || 0) - (a.points || 0))
        });
      }
    }
    
    return groupsArray;
  }, [teams]);

  if (teams.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Group stage not yet available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        Group Stage
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.name} className="glass-card overflow-hidden">
            <div className="bg-primary/10 px-4 py-2 border-b border-border">
              <h4 className="font-bold text-primary">{group.name}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Team</th>
                    <th className="p-3 text-center">P</th>
                    <th className="p-3 text-center">W</th>
                    <th className="p-3 text-center">D</th>
                    <th className="p-3 text-center">L</th>
                    <th className="p-3 text-center">GD</th>
                    <th className="p-3 text-center text-primary">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams.map((team, index) => {
                    const played = (team.wins || 0) + (team.draws || 0) + (team.losses || 0);
                    const gd = (team.goals_for || 0) - (team.goals_against || 0);
                    const qualifies = index < 2; // Top 2 qualify

                    return (
                      <tr 
                        key={team.id}
                        className={`border-b border-border/50 last:border-0 ${
                          qualifies ? 'border-l-2 border-l-green-500' : ''
                        }`}
                      >
                        <td className="p-3">
                          <span className={`font-bold ${qualifies ? 'text-green-500' : ''}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                              {team.short_name || team.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm">{played}</td>
                        <td className="p-3 text-center text-sm text-green-500">{team.wins || 0}</td>
                        <td className="p-3 text-center text-sm">{team.draws || 0}</td>
                        <td className="p-3 text-center text-sm text-red-500">{team.losses || 0}</td>
                        <td className="p-3 text-center text-sm">
                          <span className={gd > 0 ? 'text-green-500' : gd < 0 ? 'text-red-500' : ''}>
                            {gd > 0 ? `+${gd}` : gd}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-primary">{team.points || 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          Qualifies for knockout stage
        </span>
      </div>
    </div>
  );
}
