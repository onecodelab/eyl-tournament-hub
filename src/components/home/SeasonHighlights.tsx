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
  return;
}