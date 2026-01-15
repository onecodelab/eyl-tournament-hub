import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  organizeKnockoutMatches, 
  getKnockoutSlotLabel,
  calculateStandingsFromMatches,
  generateKnockoutPairings,
  type TeamStanding,
  type Match as UtilMatch,
  type Team as UtilTeam
} from "@/utils/tournamentUtils";

interface Match {
  id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  match_date: string | null;
  venue: string | null;
  status: string | null;
  stage?: string | null;
  tagline?: string | null;
}

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  group_name?: string | null;
}

interface KnockoutBracketProps {
  matches: Match[];
  teams: Map<string, Team>;
  groupTeams?: Team[];
  groupMatches?: Match[];
  teamsQualifyingPerGroup?: number;
}

export function KnockoutBracket({ 
  matches, 
  teams,
  groupTeams = [],
  groupMatches = [],
  teamsQualifyingPerGroup = 2
}: KnockoutBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Calculate group standings if group data is provided
  const groupStandings = useMemo(() => {
    if (groupTeams.length === 0) return null;
    
    const utilTeams: UtilTeam[] = groupTeams.map(t => ({
      id: t.id,
      name: t.name,
      short_name: t.short_name,
      logo_url: t.logo_url,
      group_name: t.group_name || null,
    }));

    const utilMatches: UtilMatch[] = groupMatches.map(m => ({
      id: m.id,
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      home_score: m.home_score,
      away_score: m.away_score,
      status: m.status,
      stage: m.stage || 'group',
      match_date: m.match_date,
      venue: m.venue
    }));

    return calculateStandingsFromMatches(utilTeams, utilMatches, teamsQualifyingPerGroup);
  }, [groupTeams, groupMatches, teamsQualifyingPerGroup]);

  // Generate expected knockout pairings based on group standings
  const expectedPairings = useMemo(() => {
    if (!groupStandings) return [];
    return generateKnockoutPairings(groupStandings, teamsQualifyingPerGroup);
  }, [groupStandings, teamsQualifyingPerGroup]);

  // Organize matches by stage with proper round names
  const rounds = useMemo(() => {
    const stageOrder = ['round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final'];
    const stageNames: Record<string, string> = {
      'round_of_16': 'Round of 16',
      'quarter_final': 'Quarter-Finals',
      'semi_final': 'Semi-Finals',
      'third_place': 'Third Place',
      'final': 'Final'
    };

    // Filter to only knockout matches
    const knockoutMatches = matches.filter(m => 
      m.stage && m.stage !== 'group'
    );

    const organizedRounds: { name: string; matches: Match[] }[] = [];

    // First, try to organize by stage field
    stageOrder.forEach(stage => {
      const stageMatches = knockoutMatches.filter(m => m.stage === stage);
      if (stageMatches.length > 0) {
        organizedRounds.push({
          name: stageNames[stage] || stage,
          matches: stageMatches
        });
      }
    });

    // If no stage-based matches, try tagline-based organization
    if (organizedRounds.length === 0 && matches.length > 0) {
      const roundNames = ['Final', 'Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32'];
      
      roundNames.forEach(roundName => {
        const roundMatches = matches.filter(m => 
          m.tagline?.toLowerCase().includes(roundName.toLowerCase())
        );
        if (roundMatches.length > 0) {
          organizedRounds.push({ name: roundName, matches: roundMatches });
        }
      });

      // Fallback: organize by number of matches
      if (organizedRounds.length === 0) {
        if (matches.length === 1) {
          organizedRounds.push({ name: 'Final', matches });
        } else if (matches.length <= 3) {
          const final = matches.slice(0, 1);
          const semis = matches.slice(1);
          organizedRounds.push({ name: 'Final', matches: final });
          if (semis.length) organizedRounds.push({ name: 'Semi-Finals', matches: semis });
        } else {
          organizedRounds.push({ name: 'Knockout Matches', matches });
        }
      }
    }

    // Reverse to show Final first (right side of bracket)
    return organizedRounds.reverse();
  }, [matches]);

  const getTeamDisplay = (teamId: string | null, matchStage?: string) => {
    if (!teamId) {
      // Check if we have expected pairings from group stage
      return { name: 'TBD', shortName: '?', logo: null, qualified: false };
    }
    const team = teams.get(teamId);
    
    // Check if this team is qualified from group stage
    let isQualified = false;
    if (groupStandings) {
      groupStandings.forEach(standings => {
        const teamStanding = standings.find(s => s.id === teamId);
        if (teamStanding?.qualified) {
          isQualified = true;
        }
      });
    }
    
    return {
      name: team?.name || 'Unknown',
      shortName: team?.short_name || team?.name?.slice(0, 3).toUpperCase() || '???',
      logo: team?.logo_url,
      qualified: isQualified,
      groupName: team?.group_name
    };
  };

  const getWinner = (match: Match) => {
    if (match.status !== 'completed' || match.home_score === null || match.away_score === null) {
      return null;
    }
    if (match.home_score > match.away_score) return match.home_team_id;
    if (match.away_score > match.home_score) return match.away_team_id;
    return null;
  };

  // Get the seeding label for TBD teams
  const getSeedingLabel = (position: 'home' | 'away', matchIndex: number, stage: string) => {
    if (expectedPairings.length === 0) return 'TBD';
    
    const pairing = expectedPairings[matchIndex];
    if (!pairing) return 'TBD';
    
    const team = position === 'home' ? pairing.home : pairing.away;
    if (team) {
      return getKnockoutSlotLabel(team.group_name, team.position);
    }
    return 'TBD';
  };

  if (matches.length === 0) {
    // Show expected bracket from group standings if available
    if (expectedPairings.length > 0) {
      return (
        <div className="glass-card p-6 overflow-x-auto">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Knockout matches will be determined after group stage completes
            </p>
          </div>
          <div className="flex gap-8 min-w-max justify-center">
            <div className="flex flex-col gap-4" style={{ minWidth: 220 }}>
              <h4 className="text-sm font-bold text-primary text-center mb-2">
                Expected Matchups
              </h4>
              {expectedPairings.map((pairing, idx) => (
                <div 
                  key={idx}
                  className="bg-secondary/50 rounded-lg p-3 border border-border border-dashed"
                >
                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {pairing.home?.short_name?.slice(0, 3) || '?'}
                      </div>
                      <span className="text-sm truncate max-w-[100px]">
                        {pairing.home ? pairing.home.name : getKnockoutSlotLabel(null, 1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {pairing.home?.group_name ? `1st ${pairing.home.group_name}` : ''}
                    </span>
                  </div>
                  <div className="border-t border-border/50 my-1" />
                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {pairing.away?.short_name?.slice(0, 3) || '?'}
                      </div>
                      <span className="text-sm truncate max-w-[100px]">
                        {pairing.away ? pairing.away.name : getKnockoutSlotLabel(null, 2)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {pairing.away?.group_name ? `2nd ${pairing.away.group_name}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center min-w-[100px]">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-sm font-bold mt-2 text-center">Champion</p>
            </div>
          </div>
        </div>
      );
    }

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
            <div key={round.name} className="flex flex-col gap-4" style={{ minWidth: 220 }}>
              <h4 className="text-sm font-bold text-primary text-center mb-2">{round.name}</h4>
              <div 
                className="flex flex-col gap-4 justify-around h-full"
                style={{ 
                  paddingTop: roundIndex * 40,
                  paddingBottom: roundIndex * 40 
                }}
              >
                {round.matches.map((match, matchIndex) => {
                  const homeTeam = getTeamDisplay(match.home_team_id, match.stage || undefined);
                  const awayTeam = getTeamDisplay(match.away_team_id, match.stage || undefined);
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
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 font-medium animate-pulse">
                            LIVE
                          </span>
                        </div>
                      )}
                      
                      {/* Home Team */}
                      <div className={`flex items-center justify-between gap-2 py-1 ${
                        isCompleted && winner === match.home_team_id ? 'text-primary font-bold' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          {homeTeam.logo ? (
                            <img 
                              src={homeTeam.logo} 
                              alt={homeTeam.name}
                              className={`w-6 h-6 rounded-full object-cover ${
                                winner === match.home_team_id ? 'ring-2 ring-primary' : ''
                              }`}
                            />
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              winner === match.home_team_id ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
                            }`}>
                              {homeTeam.shortName}
                            </div>
                          )}
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
                          {awayTeam.logo ? (
                            <img 
                              src={awayTeam.logo} 
                              alt={awayTeam.name}
                              className={`w-6 h-6 rounded-full object-cover ${
                                winner === match.away_team_id ? 'ring-2 ring-primary' : ''
                              }`}
                            />
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              winner === match.away_team_id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {awayTeam.shortName}
                            </div>
                          )}
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
                  {getTeamDisplay(selectedMatch.home_team_id).logo ? (
                    <img 
                      src={getTeamDisplay(selectedMatch.home_team_id).logo!} 
                      alt={getTeamDisplay(selectedMatch.home_team_id).name}
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-2">
                      {getTeamDisplay(selectedMatch.home_team_id).shortName}
                    </div>
                  )}
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
                  {getTeamDisplay(selectedMatch.away_team_id).logo ? (
                    <img 
                      src={getTeamDisplay(selectedMatch.away_team_id).logo!} 
                      alt={getTeamDisplay(selectedMatch.away_team_id).name}
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-bold mx-auto mb-2">
                      {getTeamDisplay(selectedMatch.away_team_id).shortName}
                    </div>
                  )}
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
