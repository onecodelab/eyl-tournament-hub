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
  isNewlyQualified = false,
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
      "flex items-center gap-1.5 lg:gap-2 transition-all duration-300 py-1 lg:py-1.5 px-1.5 lg:px-2",
      isWinner && "bg-primary/10"
    )}>
      {/* Team Logo */}
      <div className={cn(
        "relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 flex-shrink-0",
        "w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7",
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
            "w-full h-full rounded-full flex items-center justify-center font-bold text-[8px] lg:text-[10px]",
            isWinner ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}>
            {team.short_name || team.name.slice(0, 3).toUpperCase()}
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
            <HelpCircle className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-500" />
          </div>
        )}
      </div>

      {/* Team Name */}
      <span className={cn(
        "flex-1 font-medium truncate transition-colors min-w-0 text-[10px] lg:text-xs",
        hasTrueTeam ? (isWinner ? "text-primary font-semibold" : "text-foreground/90") : "text-muted-foreground/60 italic"
      )}>
        {hasTrueTeam ? (team.short_name || team.name) : "TBD"}
      </span>

      {/* Score */}
      <span className={cn(
        "font-mono text-right flex-shrink-0 text-[10px] lg:text-xs min-w-[14px] lg:min-w-[18px]",
        isWinner ? "text-primary font-bold" : "text-muted-foreground/70"
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
        "bracket-match-card rounded-md lg:rounded-lg overflow-hidden transition-all duration-200 w-full",
        "bg-[hsl(218,50%,14%)] border border-[hsl(218,40%,20%)]",
        "shadow-sm hover:shadow-md hover:shadow-primary/5",
        hasMatch && "cursor-pointer hover:border-primary/40"
      )}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="bg-green-500/20 px-1 py-0.5 text-center">
          <span className="text-[8px] lg:text-[9px] font-bold text-green-400 animate-pulse">● LIVE</span>
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
      <div className="flex items-center px-1.5">
        <div className="flex-1 border-t border-[hsl(218,40%,25%)]" />
        <span className="px-1 text-[7px] lg:text-[8px] text-muted-foreground/50 font-medium">VS</span>
        <div className="flex-1 border-t border-[hsl(218,40%,25%)]" />
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
        <div className="px-1.5 py-0.5 text-center border-t border-[hsl(218,40%,20%)]">
          <p className="text-[7px] lg:text-[8px] text-muted-foreground/60">
            {format(new Date(match.match_date), "MMM d, HH:mm")}
          </p>
        </div>
      )}
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

  // Render column with matches and connectors
  const renderColumn = (
    slots: BracketSlot[], 
    label: string, 
    roundIndex: number,
    side: 'left' | 'right' | 'center' = 'left'
  ) => {
    return (
      <div className="flex flex-col h-full">
        {/* Round Label */}
        <h4 className={cn(
          "text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] font-bold text-center mb-1.5 lg:mb-2 tracking-widest uppercase",
          side === 'center' ? "text-primary" : "text-primary/70"
        )}>
          {label}
        </h4>

        {/* Match Slots Container */}
        <div className="flex-1 flex flex-col justify-around py-1">
          {slots.map((slot, idx) => (
            <div key={slot.id} className="relative flex items-center">
              {/* Left connector line */}
              {side === 'left' && roundIndex > 0 && (
                <div className="absolute -left-1 md:-left-2 lg:-left-3 top-1/2 w-1 md:w-2 lg:w-3 h-px bg-[hsl(218,40%,30%)]" />
              )}
              
              {/* Match Card */}
              <div className="flex-1">
                <MatchCard
                  slot={slot}
                  teams={teams}
                  onClick={() => slot.match && setSelectedMatch(slot.match)}
                />
              </div>
              
              {/* Right connector line */}
              {side === 'left' && roundIndex < 2 && (
                <div className="absolute -right-1 md:-right-2 lg:-right-3 top-1/2 w-1 md:w-2 lg:w-3 h-px bg-[hsl(218,40%,30%)]" />
              )}
              
              {/* Right side connectors (mirrored) */}
              {side === 'right' && roundIndex > 0 && (
                <div className="absolute -right-1 md:-right-2 lg:-right-3 top-1/2 w-1 md:w-2 lg:w-3 h-px bg-[hsl(218,40%,30%)]" />
              )}
              {side === 'right' && roundIndex < 2 && (
                <div className="absolute -left-1 md:-left-2 lg:-left-3 top-1/2 w-1 md:w-2 lg:w-3 h-px bg-[hsl(218,40%,30%)]" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bracket-container rounded-xl p-2 md:p-3 lg:p-4 xl:p-5 bg-gradient-to-b from-[hsl(218,57%,8%)] to-[hsl(218,57%,12%)] w-full overflow-hidden">
        {/* 7-Column Butterfly Grid - Full Width */}
        <div className="grid grid-cols-7 w-full min-h-[450px] md:min-h-[500px] lg:min-h-[550px] xl:min-h-[600px]">
          {/* Column 1: Left Round of 16 */}
          <div className="px-0.5 md:px-1">
            {renderColumn(bracketData.left.roundOf16, "R16", 0, 'left')}
          </div>

          {/* Column 2: Left Quarterfinals */}
          <div className="px-0.5 md:px-1">
            {renderColumn(bracketData.left.quarterFinals, "QF", 1, 'left')}
          </div>

          {/* Column 3: Left Semifinals */}
          <div className="px-0.5 md:px-1">
            {renderColumn(bracketData.left.semiFinals, "SF", 2, 'left')}
          </div>

          {/* Column 4: Center - Final & Trophy */}
          <div className="px-0.5 md:px-1 flex flex-col items-center justify-center">
            {/* Final Label */}
            <h4 className="text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs font-bold text-primary text-center mb-1.5 lg:mb-2 tracking-widest uppercase">
              FINAL
            </h4>

            {/* Final Match Card */}
            <div className="w-full mb-3 lg:mb-4">
              <MatchCard
                slot={bracketData.final}
                teams={teams}
                onClick={() => bracketData.final.match && setSelectedMatch(bracketData.final.match)}
              />
            </div>

            {/* Trophy & Champion */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full flex items-center justify-center transition-all duration-500",
                champion 
                  ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-[0_0_25px_rgba(255,193,7,0.6)]"
                  : "bg-[hsl(218,50%,18%)] border border-dashed border-amber-500/30"
              )}>
                <Trophy className={cn(
                  "h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8",
                  champion ? "text-[hsl(218,57%,10%)]" : "text-amber-500/40"
                )} />
              </div>
              <p className={cn(
                "text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs font-bold mt-1.5 lg:mt-2 text-center tracking-wide",
                champion ? "text-amber-400" : "text-muted-foreground/50"
              )}>
                {champion ? champion.name : "CHAMPION"}
              </p>
            </div>
          </div>

          {/* Column 5: Right Semifinals */}
          <div className="px-0.5 md:px-1">
            {renderColumn(bracketData.right.semiFinals, "SF", 2, 'right')}
          </div>

          {/* Column 6: Right Quarterfinals */}
          <div className="px-0.5 md:px-1">
            {renderColumn(bracketData.right.quarterFinals, "QF", 1, 'right')}
          </div>

          {/* Column 7: Right Round of 16 */}
          <div className="px-0.5 md:px-1">
            {renderColumn(bracketData.right.roundOf16, "R16", 0, 'right')}
          </div>
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
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6);
          }
        }

        .animate-team-appear {
          animation: teamAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .team-glow {
          animation: glowPulse 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
