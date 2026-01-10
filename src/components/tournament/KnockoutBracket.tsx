import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Match {
  id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  match_date: string | null;
  venue: string | null;
  status: string | null;
  tagline?: string | null;
}

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
}

interface KnockoutBracketProps {
  matches: Match[];
  teams: Map<string, Team>;
}

export function KnockoutBracket({ matches, teams }: KnockoutBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Organize matches by round based on tagline or position
  const rounds = useMemo(() => {
    const roundNames = ['Final', 'Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32'];
    const organizedRounds: { name: string; matches: Match[] }[] = [];

    // Try to organize by tagline first
    const matchesByTagline = new Map<string, Match[]>();
    matches.forEach(match => {
      const tagline = match.tagline?.toLowerCase() || 'match';
      if (!matchesByTagline.has(tagline)) {
        matchesByTagline.set(tagline, []);
      }
      matchesByTagline.get(tagline)!.push(match);
    });

    // If we have tagged matches, use them
    if (matchesByTagline.size > 1 || !matchesByTagline.has('match')) {
      roundNames.forEach(roundName => {
        const roundMatches = matches.filter(m => 
          m.tagline?.toLowerCase().includes(roundName.toLowerCase())
        );
        if (roundMatches.length > 0) {
          organizedRounds.push({ name: roundName, matches: roundMatches });
        }
      });
    }

    // Fallback: organize by number of matches (typical bracket structure)
    if (organizedRounds.length === 0 && matches.length > 0) {
      // Single match = final
      if (matches.length === 1) {
        organizedRounds.push({ name: 'Final', matches });
      } else if (matches.length <= 3) {
        const final = matches.slice(0, 1);
        const semis = matches.slice(1);
        organizedRounds.push({ name: 'Final', matches: final });
        if (semis.length) organizedRounds.push({ name: 'Semi-Finals', matches: semis });
      } else {
        // Just show all matches grouped
        organizedRounds.push({ name: 'Knockout Matches', matches });
      }
    }

    return organizedRounds;
  }, [matches]);

  const getTeamDisplay = (teamId: string | null) => {
    if (!teamId) return { name: 'TBD', shortName: '?', logo: null };
    const team = teams.get(teamId);
    return {
      name: team?.name || 'Unknown',
      shortName: team?.short_name || team?.name?.slice(0, 2).toUpperCase() || '??',
      logo: team?.logo_url
    };
  };

  const getWinner = (match: Match) => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null;
    }
    if (match.home_score > match.away_score) return match.home_team_id;
    if (match.away_score > match.home_score) return match.away_team_id;
    return null; // Draw (shouldn't happen in knockout)
  };

  if (matches.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Bracket not yet available</p>
        <p className="text-sm text-muted-foreground mt-1">Matches will appear once the knockout stage begins</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card p-6 overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {rounds.map((round, roundIndex) => (
            <div key={round.name} className="flex flex-col gap-4" style={{ minWidth: 200 }}>
              <h4 className="text-sm font-bold text-primary text-center mb-2">{round.name}</h4>
              <div 
                className="flex flex-col gap-4 justify-around h-full"
                style={{ 
                  paddingTop: roundIndex * 40,
                  paddingBottom: roundIndex * 40 
                }}
              >
                {round.matches.map((match) => {
                  const homeTeam = getTeamDisplay(match.home_team_id);
                  const awayTeam = getTeamDisplay(match.away_team_id);
                  const winner = getWinner(match);
                  const isCompleted = match.status === 'completed';
                  const isLive = match.status === 'live';

                  return (
                    <div 
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className="bg-secondary/50 rounded-lg p-3 cursor-pointer hover:bg-secondary transition-colors border border-border hover:border-primary/50"
                    >
                      {isLive && (
                        <div className="flex justify-center mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 font-medium">
                            LIVE
                          </span>
                        </div>
                      )}
                      
                      {/* Home Team */}
                      <div className={`flex items-center justify-between gap-2 py-1 ${
                        isCompleted && winner === match.home_team_id ? 'text-primary font-bold' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            winner === match.home_team_id ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
                          }`}>
                            {homeTeam.shortName}
                          </div>
                          <span className="text-sm truncate max-w-[100px]">{homeTeam.name}</span>
                        </div>
                        <span className="text-sm font-mono">
                          {isCompleted || isLive ? match.home_score ?? '-' : '-'}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-border/50 my-1" />

                      {/* Away Team */}
                      <div className={`flex items-center justify-between gap-2 py-1 ${
                        isCompleted && winner === match.away_team_id ? 'text-primary font-bold' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            winner === match.away_team_id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {awayTeam.shortName}
                          </div>
                          <span className="text-sm truncate max-w-[100px]">{awayTeam.name}</span>
                        </div>
                        <span className="text-sm font-mono">
                          {isCompleted || isLive ? match.away_score ?? '-' : '-'}
                        </span>
                      </div>

                      {/* Date */}
                      {match.match_date && !isCompleted && (
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                          {format(new Date(match.match_date), "MMM d, HH:mm")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Trophy/Winner */}
          {rounds.length > 0 && rounds[0].name === 'Final' && (
            <div className="flex flex-col items-center justify-center min-w-[100px]">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-sm font-bold mt-2 text-center">
                {rounds[0].matches[0]?.status === 'completed' 
                  ? getTeamDisplay(getWinner(rounds[0].matches[0])).name
                  : 'Champion'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Match Detail Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-2">
                    {getTeamDisplay(selectedMatch.home_team_id).shortName}
                  </div>
                  <p className="font-medium">{getTeamDisplay(selectedMatch.home_team_id).name}</p>
                </div>
                <div className="text-center">
                  {selectedMatch.status === 'completed' || selectedMatch.status === 'live' ? (
                    <div className="text-3xl font-bold">
                      {selectedMatch.home_score ?? 0} - {selectedMatch.away_score ?? 0}
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-primary">VS</span>
                  )}
                </div>
                <div className="text-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-bold mx-auto mb-2">
                    {getTeamDisplay(selectedMatch.away_team_id).shortName}
                  </div>
                  <p className="font-medium">{getTeamDisplay(selectedMatch.away_team_id).name}</p>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground space-y-1">
                {selectedMatch.match_date && (
                  <p>{format(new Date(selectedMatch.match_date), "EEEE, MMMM d, yyyy 'at' HH:mm")}</p>
                )}
                {selectedMatch.venue && <p>{selectedMatch.venue}</p>}
                {selectedMatch.tagline && (
                  <p className="text-primary font-medium">{selectedMatch.tagline}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
