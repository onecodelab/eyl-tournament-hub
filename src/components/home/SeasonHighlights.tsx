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
  
  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <EYLLogo size={40} />
          <h2 className="text-2xl font-bold">Season Highlights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Goals */}
          <div className="bg-card rounded-lg p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Goal className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Total Goals</h3>
            </div>
            <p className="text-3xl font-bold">{totalGoals}</p>
            <p className="text-sm text-muted-foreground">Across all matches</p>
          </div>

          {/* Completed Matches */}
          <div className="bg-card rounded-lg p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Matches Played</h3>
            </div>
            <p className="text-3xl font-bold">{completedMatches}</p>
            <p className="text-sm text-muted-foreground">Completed fixtures</p>
          </div>

          {/* Best Defense */}
          {bestDefense && (
            <div className="bg-card rounded-lg p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Best Defense</h3>
              </div>
              <p className="text-xl font-bold">{bestDefense.name}</p>
              <p className="text-sm text-muted-foreground">
                {bestDefense.goals_against || 0} goals conceded
              </p>
            </div>
          )}

          {/* Current Champion */}
          {champion && (
            <div className="bg-card rounded-lg p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h3 className="font-semibold">Top Team</h3>
              </div>
              <p className="text-xl font-bold">{champion.name}</p>
              <p className="text-sm text-muted-foreground">
                {champion.points || 0} points
              </p>
            </div>
          )}
        </div>

        {/* Top Scorers */}
        {topScorers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Top Scorers</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topScorers.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-card rounded-lg p-4 border border-border/50 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate">{player.name}</p>
                  <p className="text-lg font-bold text-primary">
                    {player.goals || 0} goals
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}