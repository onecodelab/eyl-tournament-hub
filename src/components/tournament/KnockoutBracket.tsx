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

// Define the bracket structure with empty slots
interface BracketSlot {
  id: string;
  match?: Match;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
}

interface BracketRound {
  name: string;
  stage: string;
  slots: BracketSlot[];
}

export function KnockoutBracket({ 
  matches, 
  teams,
}: KnockoutBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Organize matches by stage
  const matchesByStage = useMemo(() => {
    const byStage: Record<string, Match[]> = {};
    matches.forEach(m => {
      const stage = m.stage || 'unknown';
      if (stage !== 'group') {
        if (!byStage[stage]) byStage[stage] = [];
        byStage[stage].push(m);
      }
    });
    return byStage;
  }, [matches]);

  // Build the bracket structure based on actual knockout matches
  const bracketStructure = useMemo(() => {
    const stages = [
      { name: 'Round of 16', stage: 'round_of_16', expectedSlots: 8 },
      { name: 'Quarter-Finals', stage: 'quarter_final', expectedSlots: 4 },
      { name: 'Semi-Finals', stage: 'semi_final', expectedSlots: 2 },
      { name: 'Final', stage: 'final', expectedSlots: 1 },
    ];

    // Determine which stages we need based on what matches exist
    const existingStages = Object.keys(matchesByStage);
    
    // If no knockout matches exist, show empty bracket structure
    if (existingStages.length === 0) {
      return stages.map(s => ({
        name: s.name,
        stage: s.stage,
        slots: Array.from({ length: s.expectedSlots }, (_, i) => ({
          id: `${s.stage}-${i}`,
          match: undefined,
          homeTeamId: null,
          awayTeamId: null,
        }))
      }));
    }

    // Build structure based on existing matches
    const result: BracketRound[] = [];
    
    stages.forEach(stageInfo => {
      const stageMatches = matchesByStage[stageInfo.stage] || [];
      
      if (stageMatches.length > 0) {
        result.push({
          name: stageInfo.name,
          stage: stageInfo.stage,
          slots: stageMatches.map((m, i) => ({
            id: m.id,
            match: m,
            homeTeamId: m.home_team_id,
            awayTeamId: m.away_team_id,
          }))
        });
      } else if (result.length > 0) {
        // Add empty slots for subsequent stages
        const prevRound = result[result.length - 1];
        const expectedSlots = Math.ceil(prevRound.slots.length / 2);
        result.push({
          name: stageInfo.name,
          stage: stageInfo.stage,
          slots: Array.from({ length: expectedSlots }, (_, i) => ({
            id: `${stageInfo.stage}-${i}`,
            match: undefined,
            homeTeamId: null,
            awayTeamId: null,
          }))
        });
      }
    });

    return result;
  }, [matchesByStage]);

  const getTeamDisplay = (teamId: string | null) => {
    if (!teamId) {
      return { name: 'TBD', shortName: '?', logo: null };
    }
    const team = teams.get(teamId);
    return {
      name: team?.name || 'Unknown',
      shortName: team?.short_name || team?.name?.slice(0, 3).toUpperCase() || '???',
      logo: team?.logo_url,
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

  // Get champion if final is complete
  const champion = useMemo(() => {
    const finalRound = bracketStructure.find(r => r.stage === 'final');
    if (finalRound?.slots[0]?.match) {
      const finalMatch = finalRound.slots[0].match;
      const winnerId = getWinner(finalMatch);
      if (winnerId) {
        return getTeamDisplay(winnerId);
      }
    }
    return null;
  }, [bracketStructure, teams]);

  // If no structure at all, show placeholder
  if (bracketStructure.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Bracket not yet available</p>
        <p className="text-sm text-muted-foreground mt-1">Knockout matches will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card p-6 overflow-x-auto">
        <div className="flex gap-8 min-w-max items-start">
          {bracketStructure.map((round, roundIndex) => (
            <div key={round.stage} className="flex flex-col gap-4" style={{ minWidth: 220 }}>
              <h4 className="text-sm font-bold text-primary text-center mb-2">{round.name}</h4>
              <div 
                className="flex flex-col gap-4 justify-around h-full"
                style={{ 
                  paddingTop: roundIndex * 40,
                  paddingBottom: roundIndex * 40 
                }}
              >
                {round.slots.map((slot) => {
                  const match = slot.match;
                  const homeTeam = getTeamDisplay(slot.homeTeamId || null);
                  const awayTeam = getTeamDisplay(slot.awayTeamId || null);
                  const winner = match ? getWinner(match) : null;
                  const isCompleted = match?.status === 'completed';
                  const isLive = match?.status === 'live';
                  const hasMatch = !!match;

                  return (
                    <div 
                      key={slot.id}
                      onClick={() => match && setSelectedMatch(match)}
                      className={`bg-secondary/50 rounded-lg p-3 border border-border transition-colors ${
                        hasMatch ? 'cursor-pointer hover:bg-secondary hover:border-primary/50' : 'border-dashed opacity-70'
                      }`}
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
                        isCompleted && winner === slot.homeTeamId ? 'text-primary font-bold' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          {homeTeam.logo ? (
                            <img 
                              src={homeTeam.logo} 
                              alt={homeTeam.name}
                              className={`w-6 h-6 rounded-full object-cover ${
                                winner === slot.homeTeamId ? 'ring-2 ring-primary' : ''
                              }`}
                            />
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              winner === slot.homeTeamId ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
                            }`}>
                              {homeTeam.shortName}
                            </div>
                          )}
                          <span className="text-sm truncate max-w-[100px]">{homeTeam.name}</span>
                        </div>
                        <span className="text-sm font-mono">
                          {isCompleted || isLive ? match?.home_score ?? '-' : '-'}
                        </span>
                      </div>

                      {/* VS Divider */}
                      <div className="flex items-center gap-2 my-1">
                        <div className="flex-1 border-t border-border/50" />
                        <span className="text-xs text-muted-foreground">VS</span>
                        <div className="flex-1 border-t border-border/50" />
                      </div>

                      {/* Away Team */}
                      <div className={`flex items-center justify-between gap-2 py-1 ${
                        isCompleted && winner === slot.awayTeamId ? 'text-primary font-bold' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          {awayTeam.logo ? (
                            <img 
                              src={awayTeam.logo} 
                              alt={awayTeam.name}
                              className={`w-6 h-6 rounded-full object-cover ${
                                winner === slot.awayTeamId ? 'ring-2 ring-primary' : ''
                              }`}
                            />
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              winner === slot.awayTeamId ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {awayTeam.shortName}
                            </div>
                          )}
                          <span className="text-sm truncate max-w-[100px]">{awayTeam.name}</span>
                        </div>
                        <span className="text-sm font-mono">
                          {isCompleted || isLive ? match?.away_score ?? '-' : '-'}
                        </span>
                      </div>

                      {/* Date */}
                      {match?.match_date && !isCompleted && (
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

          {/* Trophy/Champion */}
          <div className="flex flex-col items-center justify-center min-w-[100px]" style={{ paddingTop: bracketStructure.length * 40 }}>
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-sm font-bold mt-2 text-center">
              {champion ? champion.name : 'Champion'}
            </p>
          </div>
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
