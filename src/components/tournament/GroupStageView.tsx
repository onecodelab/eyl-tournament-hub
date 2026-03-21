import { useMemo } from "react";
import { Trophy, CheckCircle2 } from "lucide-react";
import { calculateStandingsFromMatches, type TeamStanding, type Match as UtilMatch, type Team as UtilTeam } from "@/utils/tournamentUtils";

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url?: string | null;
  group_name?: string | null;
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
  stage?: string | null;
}

interface GroupStageViewProps {
  teams: Team[];
  matches: Match[];
  teamsMap: Map<string, Team>;
  teamsQualifyingPerGroup?: number;
}

export function GroupStageView({ 
  teams, 
  matches, 
  teamsMap,
  teamsQualifyingPerGroup = 2 
}: GroupStageViewProps) {
  // Calculate dynamic standings from match results
  const groupStandings = useMemo(() => {
    // Convert to utility types
    const utilTeams: UtilTeam[] = teams.map(t => ({
      id: t.id,
      name: t.name,
      short_name: t.short_name,
      logo_url: t.logo_url || null,
      group_name: t.group_name || null,
      points: t.points,
      wins: t.wins,
      draws: t.draws,
      losses: t.losses,
      goals_for: t.goals_for,
      goals_against: t.goals_against
    }));

    const utilMatches: UtilMatch[] = matches.map(m => ({
      id: m.id,
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      home_score: m.home_score,
      away_score: m.away_score,
      status: m.status,
      stage: m.stage || null,
      match_date: null,
      venue: null
    }));

    return calculateStandingsFromMatches(utilTeams, utilMatches, teamsQualifyingPerGroup);
  }, [teams, matches, teamsQualifyingPerGroup]);

  // Convert map to sorted array of groups
  const groups = useMemo(() => {
    const groupsArray: { name: string; teams: TeamStanding[] }[] = [];
    
    // Sort group names alphabetically
    const sortedGroupNames = Array.from(groupStandings.keys())
      .filter(name => name !== 'No Group')
      .sort();
    
    sortedGroupNames.forEach(groupName => {
      const groupTeams = groupStandings.get(groupName) || [];
      groupsArray.push({
        name: groupName,
        teams: groupTeams
      });
    });

    // If no groups assigned, create them based on team order
    if (groupsArray.length === 0 && teams.length > 0) {
      const numGroups = Math.ceil(teams.length / 4);
      for (let i = 0; i < numGroups; i++) {
        const groupTeams = teams.slice(i * 4, (i + 1) * 4);
        if (groupTeams.length > 0) {
          groupsArray.push({
            name: `Group ${String.fromCharCode(65 + i)}`,
            teams: groupTeams.map((t, idx) => ({
              id: t.id,
              name: t.name,
              short_name: t.short_name,
              logo_url: t.logo_url || null,
              group_name: `Group ${String.fromCharCode(65 + i)}`,
              played: (t.wins || 0) + (t.draws || 0) + (t.losses || 0),
              wins: t.wins || 0,
              draws: t.draws || 0,
              losses: t.losses || 0,
              goals_for: t.goals_for || 0,
              goals_against: t.goals_against || 0,
              goal_difference: (t.goals_for || 0) - (t.goals_against || 0),
              points: t.points || 0,
              qualified: idx < teamsQualifyingPerGroup,
              position: idx + 1
            })).sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference)
          });
        }
      }
    }
    
    return groupsArray;
  }, [groupStandings, teams, teamsQualifyingPerGroup]);

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
      
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {groups.map((group) => (
          <div key={group.name} className="glass-card overflow-hidden">
            <div className="bg-primary/10 px-4 py-2 border-b border-border">
              <h4 className="font-bold text-primary">{group.name}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                  <tr className="border-b border-border text-[10px] md:text-xs text-muted-foreground">
                     <th className="p-2 md:p-3 text-left">#</th>
                     <th className="p-2 md:p-3 text-left">Team</th>
                     <th className="p-2 md:p-3 text-center">P</th>
                     <th className="p-2 md:p-3 text-center">W</th>
                     <th className="p-2 md:p-3 text-center">D</th>
                     <th className="p-2 md:p-3 text-center">L</th>
                     <th className="p-2 md:p-3 text-center">GD</th>
                     <th className="p-2 md:p-3 text-center text-primary">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams.map((team, index) => {
                    const qualifies = team.qualified;

                    return (
                      <tr 
                        key={team.id}
                        className={`border-b border-border/50 last:border-0 ${
                          qualifies ? 'border-l-2 border-l-green-500 bg-green-500/5' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className={`font-bold ${qualifies ? 'text-green-500' : ''}`}>
                              {team.position}
                            </span>
                            {qualifies && (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {team.logo_url ? (
                              <img 
                                src={team.logo_url} 
                                alt={team.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                {team.short_name || team.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm">{team.played}</td>
                        <td className="p-3 text-center text-sm text-green-500">{team.wins}</td>
                        <td className="p-3 text-center text-sm">{team.draws}</td>
                        <td className="p-3 text-center text-sm text-red-500">{team.losses}</td>
                        <td className="p-3 text-center text-sm">
                          <span className={team.goal_difference > 0 ? 'text-green-500' : team.goal_difference < 0 ? 'text-red-500' : ''}>
                            {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-primary">{team.points}</span>
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
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          Qualifies for knockout stage (Top {teamsQualifyingPerGroup})
        </span>
      </div>
    </div>
  );
}
