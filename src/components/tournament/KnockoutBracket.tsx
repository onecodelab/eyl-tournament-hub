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
  compact = false
}: { 
  teamId: string | null; 
  teams: Map<string, Team>; 
  score?: number | null;
  showScore: boolean;
  isWinner: boolean;
  isNewlyQualified?: boolean;
  compact?: boolean;
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
      "flex items-center gap-2 transition-all duration-300",
      compact ? "py-1.5 px-2" : "py-2 px-3",
      isWinner && "bg-primary/10"
    )}>
      {/* Team Logo */}
      <div className={cn(
        "relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 flex-shrink-0",
        compact ? "w-6 h-6" : "w-8 h-8",
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
            "w-full h-full rounded-full flex items-center justify-center font-bold",
            compact ? "text-[10px]" : "text-xs",
            isWinner ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          )}>
            {team.short_name || team.name.slice(0, 3).toUpperCase()}
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-primary/30 flex items-center justify-center border-2 border-dashed border-primary/50">
            <HelpCircle className={cn(compact ? "w-3 h-3" : "w-4 h-4", "text-primary")} />
          </div>
        )}
      </div>

      {/* Team Name */}
      <span className={cn(
        "flex-1 font-medium truncate transition-colors min-w-0",
        compact ? "text-xs" : "text-sm",
        hasTrueTeam ? (isWinner ? "text-primary font-bold" : "text-foreground") : "text-muted-foreground italic"
      )}>
        {hasTrueTeam ? (team.short_name || team.name) : "TBD"}
      </span>

      {/* Score */}
      <span className={cn(
        "font-mono text-right flex-shrink-0",
        compact ? "text-xs min-w-[16px]" : "text-sm min-w-[20px]",
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
  compact = false
}: {
  slot: BracketSlot;
  teams: Map<string, Team>;
  onClick?: () => void;
  compact?: boolean;
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
        "bracket-match-card rounded-lg overflow-hidden transition-all duration-200 w-full",
        "bg-secondary/80 border border-border/50",
        "shadow-md shadow-black/20",
        hasMatch && "cursor-pointer hover:border-primary/50 hover:shadow-primary/10"
      )}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="bg-green-500/20 px-2 py-0.5 text-center">
          <span className="text-[10px] font-bold text-green-400 animate-pulse">● LIVE</span>
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
        compact={compact}
      />

      {/* VS Divider */}
      <div className="flex items-center px-2">
        <div className="flex-1 border-t border-border/30" />
        <span className="px-1.5 text-[9px] text-muted-foreground font-medium">VS</span>
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
        compact={compact}
      />

      {/* Match Date */}
      {match?.match_date && !isCompleted && (
        <div className="px-2 py-0.5 text-center border-t border-border/30">
          <p className="text-[9px] text-muted-foreground">
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

  // Render column with matches
  const renderColumn = (
    slots: BracketSlot[], 
    label: string, 
    roundIndex: number,
    totalRounds: number = 3
  ) => {
    // Calculate vertical spacing multiplier based on round
    const spacingMultiplier = Math.pow(2, roundIndex);
    
    return (
      <div className="flex flex-col h-full">
        {/* Round Label */}
        <h4 className="text-[9px] lg:text-[10px] xl:text-xs font-bold text-primary/80 text-center mb-2 lg:mb-3 tracking-wider uppercase whitespace-nowrap">
          {label}
        </h4>

        {/* Match Slots Container */}
        <div 
          className="flex-1 flex flex-col justify-around"
          style={{
            paddingTop: roundIndex > 0 ? `${spacingMultiplier * 1.5}rem` : 0,
            paddingBottom: roundIndex > 0 ? `${spacingMultiplier * 1.5}rem` : 0,
            gap: `${spacingMultiplier * 0.5}rem`,
          }}
        >
          {slots.map((slot) => (
            <MatchCard
              key={slot.id}
              slot={slot}
              teams={teams}
              onClick={() => slot.match && setSelectedMatch(slot.match)}
              compact={true}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bracket-container rounded-xl p-3 md:p-4 lg:p-6 bg-[hsl(218,57%,10%)] w-full overflow-hidden">
        {/* 7-Column Butterfly Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3 xl:gap-4 w-full min-h-[500px] lg:min-h-[600px]">
          {/* Column 1: Left Round of 16 */}
          <div className="col-span-1">
            {renderColumn(bracketData.left.roundOf16, "ROUND OF 16", 0)}
          </div>

          {/* Column 2: Left Quarterfinals */}
          <div className="col-span-1">
            {renderColumn(bracketData.left.quarterFinals, "QUARTERFINALS", 1)}
          </div>

          {/* Column 3: Left Semifinals */}
          <div className="col-span-1">
            {renderColumn(bracketData.left.semiFinals, "SEMIFINALS", 2)}
          </div>

          {/* Column 4: Center - Final & Trophy */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {/* Final Label */}
            <h4 className="text-[9px] lg:text-[10px] xl:text-xs font-bold text-primary text-center mb-2 lg:mb-3 tracking-wider uppercase">
              FINAL
            </h4>

            {/* Final Match Card */}
            <div className="w-full mb-4 lg:mb-6">
              <MatchCard
                slot={bracketData.final}
                teams={teams}
                onClick={() => bracketData.final.match && setSelectedMatch(bracketData.final.match)}
                compact={true}
              />
            </div>

            {/* Trophy & Champion */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full flex items-center justify-center transition-all duration-500",
                champion 
                  ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                  : "bg-primary/20 border-2 border-dashed border-primary/40"
              )}>
                <Trophy className={cn(
                  "h-6 w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10",
                  champion ? "text-primary-foreground" : "text-primary/60"
                )} />
              </div>
              <p className={cn(
                "text-[10px] lg:text-xs xl:text-sm font-bold mt-2 lg:mt-3 text-center",
                champion ? "text-primary" : "text-muted-foreground"
              )}>
                {champion ? champion.name : "CHAMPION"}
              </p>
            </div>
          </div>

          {/* Column 5: Right Semifinals */}
          <div className="col-span-1">
            {renderColumn(bracketData.right.semiFinals, "SEMIFINALS", 2)}
          </div>

          {/* Column 6: Right Quarterfinals */}
          <div className="col-span-1">
            {renderColumn(bracketData.right.quarterFinals, "QUARTERFINALS", 1)}
          </div>

          {/* Column 7: Right Round of 16 */}
          <div className="col-span-1">
            {renderColumn(bracketData.right.roundOf16, "ROUND OF 16", 0)}
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
