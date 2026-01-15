import { useMemo, useState, useEffect } from "react";
import { Trophy, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

interface BracketSlot {
  id: string;
  match?: Match;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  isNewlyQualified?: boolean;
}

// Team slot component with animation
function TeamSlot({ 
  teamId, 
  teams, 
  score, 
  showScore, 
  isWinner,
  isNewlyQualified = false
}: { 
  teamId: string | null; 
  teams: Map<string, Team>; 
  score?: number | null;
  showScore: boolean;
  isWinner: boolean;
  isNewlyQualified?: boolean;
}) {
  const [showGlow, setShowGlow] = useState(isNewlyQualified);
  
  useEffect(() => {
    if (isNewlyQualified) {
      setShowGlow(true);
      const timer = setTimeout(() => setShowGlow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNewlyQualified]);

  const team = teamId ? teams.get(teamId) : null;
  const hasTrueTeam = !!team;

  return (
    <div className={cn(
      "flex items-center gap-3 py-2 px-3 transition-all duration-300",
      isWinner && "bg-primary/10"
    )}>
      {/* Team Logo */}
      <div className={cn(
        "relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500",
        hasTrueTeam && isNewlyQualified && "animate-team-appear",
        showGlow && hasTrueTeam && "team-glow"
      )}>
        {hasTrueTeam && team.logo_url ? (
          <img 
            src={team.logo_url} 
            alt={team.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : hasTrueTeam ? (
          <div className={cn(
            "w-full h-full rounded-full flex items-center justify-center text-xs font-bold",
            isWinner ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          )}>
            {team.short_name || team.name.slice(0, 3).toUpperCase()}
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-primary/30 flex items-center justify-center border-2 border-dashed border-primary/50">
            <HelpCircle className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>

      {/* Team Name */}
      <span className={cn(
        "flex-1 text-sm font-medium truncate transition-colors",
        hasTrueTeam ? (isWinner ? "text-primary font-bold" : "text-foreground") : "text-muted-foreground italic"
      )}>
        {hasTrueTeam ? (team.short_name || team.name) : "TBD"}
      </span>

      {/* Score */}
      <span className={cn(
        "text-sm font-mono min-w-[20px] text-right",
        isWinner ? "text-primary font-bold" : "text-muted-foreground"
      )}>
        {showScore ? (score ?? "-") : "-"}
      </span>
    </div>
  );
}

// Match card component
function MatchCard({
  slot,
  teams,
  onClick,
}: {
  slot: BracketSlot;
  teams: Map<string, Team>;
  onClick?: () => void;
}) {
  const match = slot.match;
  const isCompleted = match?.status === "completed";
  const isLive = match?.status === "live";
  const showScore = isCompleted || isLive;
  const hasMatch = !!match;

  const getWinner = () => {
    if (!isCompleted || match.home_score === null || match.away_score === null) return null;
    if (match.home_score > match.away_score) return match.home_team_id;
    if (match.away_score > match.home_score) return match.away_team_id;
    return null;
  };

  const winner = getWinner();

  return (
    <div
      onClick={hasMatch ? onClick : undefined}
      className={cn(
        "bracket-match-card rounded-lg overflow-hidden transition-all duration-200",
        "bg-secondary/80 border border-border/50",
        "shadow-lg shadow-black/20",
        hasMatch && "cursor-pointer hover:border-primary/50 hover:shadow-primary/10"
      )}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="bg-green-500/20 px-3 py-1 text-center">
          <span className="text-xs font-bold text-green-400 animate-pulse">● LIVE</span>
        </div>
      )}

      {/* Home Team */}
      <TeamSlot
        teamId={slot.homeTeamId || null}
        teams={teams}
        score={match?.home_score}
        showScore={showScore}
        isWinner={winner === slot.homeTeamId}
        isNewlyQualified={slot.isNewlyQualified}
      />

      {/* VS Divider */}
      <div className="flex items-center px-3">
        <div className="flex-1 border-t border-border/30" />
        <span className="px-2 text-[10px] text-muted-foreground font-medium">VS</span>
        <div className="flex-1 border-t border-border/30" />
      </div>

      {/* Away Team */}
      <TeamSlot
        teamId={slot.awayTeamId || null}
        teams={teams}
        score={match?.away_score}
        showScore={showScore}
        isWinner={winner === slot.awayTeamId}
        isNewlyQualified={slot.isNewlyQualified}
      />

      {/* Match Date */}
      {match?.match_date && !isCompleted && (
        <div className="px-3 py-1 text-center border-t border-border/30">
          <p className="text-[10px] text-muted-foreground">
            {format(new Date(match.match_date), "MMM d, HH:mm")}
          </p>
        </div>
      )}
    </div>
  );
}

// Connector line component
function ConnectorLines({ roundIndex, slotsInRound, isRightSide }: { 
  roundIndex: number; 
  slotsInRound: number;
  isRightSide: boolean;
}) {
  // Don't show connectors for the round of 16 (first round) or for the final
  if (roundIndex === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: slotsInRound }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            "absolute w-4 border-t-2 border-border/40",
            isRightSide ? "right-full" : "left-full"
          )}
          style={{
            top: `${((i + 0.5) / slotsInRound) * 100}%`,
          }}
        />
      ))}
    </div>
  );
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

  // Build bracket slots for each round
  const buildRoundSlots = (stage: string, expectedSlots: number): BracketSlot[] => {
    const stageMatches = matchesByStage[stage] || [];
    
    if (stageMatches.length > 0) {
      return stageMatches.map((m) => ({
        id: m.id,
        match: m,
        homeTeamId: m.home_team_id,
        awayTeamId: m.away_team_id,
      }));
    }
    
    return Array.from({ length: expectedSlots }, (_, i) => ({
      id: `${stage}-${i}`,
      match: undefined,
      homeTeamId: null,
      awayTeamId: null,
    }));
  };

  // Build symmetric bracket structure
  const bracketData = useMemo(() => {
    const ro16Slots = buildRoundSlots('round_of_16', 8);
    const qfSlots = buildRoundSlots('quarter_final', 4);
    const sfSlots = buildRoundSlots('semi_final', 2);
    const finalSlots = buildRoundSlots('final', 1);

    // Split into left and right sides
    return {
      left: {
        roundOf16: ro16Slots.slice(0, 4),
        quarterFinals: qfSlots.slice(0, 2),
        semiFinals: sfSlots.slice(0, 1),
      },
      right: {
        roundOf16: ro16Slots.slice(4, 8),
        quarterFinals: qfSlots.slice(2, 4),
        semiFinals: sfSlots.slice(1, 2),
      },
      final: finalSlots[0],
    };
  }, [matchesByStage]);

  // Get champion if final is complete
  const champion = useMemo(() => {
    if (bracketData.final.match) {
      const finalMatch = bracketData.final.match;
      if (finalMatch.status === 'completed' && finalMatch.home_score !== null && finalMatch.away_score !== null) {
        const winnerId = finalMatch.home_score > finalMatch.away_score 
          ? finalMatch.home_team_id 
          : finalMatch.away_team_id;
        return winnerId ? teams.get(winnerId) : null;
      }
    }
    return null;
  }, [bracketData.final, teams]);

  const getTeamDisplay = (teamId: string | null) => {
    if (!teamId) return { name: 'TBD', shortName: '?', logo: null };
    const team = teams.get(teamId);
    return {
      name: team?.name || 'Unknown',
      shortName: team?.short_name || team?.name?.slice(0, 3).toUpperCase() || '???',
      logo: team?.logo_url,
    };
  };

  // Render a single side of the bracket
  const renderBracketSide = (
    side: { roundOf16: BracketSlot[]; quarterFinals: BracketSlot[]; semiFinals: BracketSlot[] },
    isRightSide: boolean
  ) => {
    const rounds = [
      { name: "ROUND OF 16", slots: side.roundOf16, spacing: 0 },
      { name: "QUARTERFINALS", slots: side.quarterFinals, spacing: 1 },
      { name: "SEMIFINALS", slots: side.semiFinals, spacing: 2 },
    ];

    // Reverse order for right side to mirror
    const orderedRounds = isRightSide ? [...rounds].reverse() : rounds;

    return (
      <div className={cn("flex gap-2 md:gap-4", isRightSide && "flex-row-reverse")}>
        {orderedRounds.map((round, roundIndex) => {
          const actualRoundIndex = isRightSide ? rounds.length - 1 - roundIndex : roundIndex;
          
          return (
            <div key={round.name} className="flex flex-col" style={{ minWidth: 180 }}>
              {/* Round Label */}
              <h4 className="text-[10px] md:text-xs font-bold text-primary/80 text-center mb-3 tracking-wider uppercase">
                {round.name}
              </h4>

              {/* Match Slots */}
              <div 
                className="relative flex flex-col justify-around flex-1"
                style={{
                  gap: `${Math.pow(2, actualRoundIndex) * 1.5}rem`,
                  paddingTop: `${actualRoundIndex * 2}rem`,
                  paddingBottom: `${actualRoundIndex * 2}rem`,
                }}
              >
                <ConnectorLines 
                  roundIndex={actualRoundIndex} 
                  slotsInRound={round.slots.length} 
                  isRightSide={isRightSide} 
                />
                
                {round.slots.map((slot) => (
                  <MatchCard
                    key={slot.id}
                    slot={slot}
                    teams={teams}
                    onClick={() => slot.match && setSelectedMatch(slot.match)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="bracket-container rounded-xl p-4 md:p-6 overflow-x-auto bg-[hsl(218,57%,10%)]">
        <div className="flex items-stretch justify-center min-w-max gap-2 md:gap-4">
          {/* Left Side */}
          {renderBracketSide(bracketData.left, false)}

          {/* Center - Final & Trophy */}
          <div className="flex flex-col items-center justify-center" style={{ minWidth: 200 }}>
            {/* Final Label */}
            <h4 className="text-xs font-bold text-primary text-center mb-3 tracking-wider uppercase">
              FINAL
            </h4>

            {/* Final Match Card */}
            <div className="mb-6">
              <MatchCard
                slot={bracketData.final}
                teams={teams}
                onClick={() => bracketData.final.match && setSelectedMatch(bracketData.final.match)}
              />
            </div>

            {/* Trophy & Champion */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                champion 
                  ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                  : "bg-primary/20 border-2 border-dashed border-primary/40"
              )}>
                <Trophy className={cn(
                  "h-10 w-10",
                  champion ? "text-primary-foreground" : "text-primary/60"
                )} />
              </div>
              <p className={cn(
                "text-sm font-bold mt-3 text-center",
                champion ? "text-primary" : "text-muted-foreground"
              )}>
                {champion ? champion.name : "CHAMPION"}
              </p>
            </div>
          </div>

          {/* Right Side */}
          {renderBracketSide(bracketData.right, true)}
        </div>
      </div>

      {/* Match Detail Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="bg-card border-border">
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

      {/* CSS for animations */}
      <style>{`
        @keyframes teamAppear {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(184, 154, 89, 0.8), 0 0 40px rgba(184, 154, 89, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(184, 154, 89, 1), 0 0 60px rgba(184, 154, 89, 0.6);
          }
        }

        .animate-team-appear {
          animation: teamAppear 0.5s ease-out forwards;
        }

        .team-glow {
          animation: glowPulse 1s ease-in-out infinite;
        }

        .bracket-match-card {
          min-width: 160px;
        }
      `}</style>
    </>
  );
}
