import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Trophy,
  Users,
  Calendar,
  CircleDot,
  Square,
  ArrowRightLeft,
  FileText,
  Medal,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TournamentData {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  format: string | null;
  logo_url: string | null;
  winner_team_id: string | null;
  winner_team?: { id: string; name: string; logo_url: string | null } | null;
}

function useTournamentHistory(tournamentId: string) {
  // Get tournament details with winner
  const tournamentQuery = useQuery({
    queryKey: ["tournament-history", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();
      if (error) throw error;
      
      // If there's a winner_team_id, fetch the winner team separately
      let winner_team = null;
      if (data.winner_team_id) {
        const { data: teamData } = await supabase
          .from("teams")
          .select("id, name, logo_url")
          .eq("id", data.winner_team_id)
          .single();
        winner_team = teamData;
      }
      
      return { ...data, winner_team } as TournamentData;
    },
    enabled: !!tournamentId,
  });

  // Get all teams for this tournament
  const teamsQuery = useQuery({
    queryKey: ["tournament-teams", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });

  // Get all players for teams in this tournament
  const playersQuery = useQuery({
    queryKey: ["tournament-players", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          team:teams(id, name, short_name)
        `)
        .not("team_id", "is", null);
      if (error) throw error;
      
      // Filter to only players from teams in this tournament
      const teamIds = teamsQuery.data?.map((t) => t.id) || [];
      return data.filter((p: any) => teamIds.includes(p.team_id));
    },
    enabled: !!tournamentId && !!teamsQuery.data,
  });

  // Get all matches for this tournament
  const matchesQuery = useQuery({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url)
        `)
        .eq("tournament_id", tournamentId)
        .order("match_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });

  // Get all match events (goals, cards, substitutions)
  const eventsQuery = useQuery({
    queryKey: ["tournament-events", tournamentId],
    queryFn: async () => {
      const matchIds = matchesQuery.data?.map((m) => m.id) || [];
      if (matchIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("match_events")
        .select(`
          *,
          team:teams(id, name, short_name),
          player:players(id, name, jersey_number)
        `)
        .in("match_id", matchIds)
        .order("minute", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!matchesQuery.data && matchesQuery.data.length > 0,
  });

  // Get match reports
  const reportsQuery = useQuery({
    queryKey: ["tournament-reports", tournamentId],
    queryFn: async () => {
      const matchIds = matchesQuery.data?.map((m) => m.id) || [];
      if (matchIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("match_reports")
        .select("*")
        .in("match_id", matchIds);
      if (error) throw error;
      return data;
    },
    enabled: !!matchesQuery.data && matchesQuery.data.length > 0,
  });

  return {
    tournament: tournamentQuery.data,
    teams: teamsQuery.data || [],
    players: playersQuery.data || [],
    matches: matchesQuery.data || [],
    events: eventsQuery.data || [],
    reports: reportsQuery.data || [],
    isLoading: tournamentQuery.isLoading || teamsQuery.isLoading || matchesQuery.isLoading,
  };
}

export default function TournamentHistory() {
  const { id } = useParams<{ id: string }>();
  const { tournament, teams, players, matches, events, reports, isLoading } =
    useTournamentHistory(id || "");

  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </Layout>
    );
  }

  // Calculate stats
  const completedMatches = matches.filter((m) => m.status === "completed");
  const totalGoals = events.filter((e) => e.event_type === "goal").length;
  const totalYellowCards = events.filter((e) => e.event_type === "yellow_card").length;
  const totalRedCards = events.filter((e) => e.event_type === "red_card").length;

  // Get top scorers
  const scorerMap = new Map<string, { player: any; goals: number }>();
  events
    .filter((e) => e.event_type === "goal" && e.player)
    .forEach((e: any) => {
      const key = e.player.id;
      if (scorerMap.has(key)) {
        scorerMap.get(key)!.goals++;
      } else {
        scorerMap.set(key, { player: e.player, goals: 1 });
      }
    });
  const topScorers = Array.from(scorerMap.values())
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);

  // Get players by team
  const getTeamPlayers = (teamId: string) => {
    return players.filter((p: any) => p.team_id === teamId);
  };

  // Get events for a match
  const getMatchEvents = (matchId: string) => {
    return events.filter((e) => e.match_id === matchId);
  };

  // Check if match has report
  const hasReport = (matchId: string) => {
    return reports.some((r) => r.match_id === matchId);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {tournament.logo_url && (
              <img
                src={tournament.logo_url}
                alt={tournament.name}
                className="h-16 w-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <p className="text-muted-foreground">Tournament Archive</p>
            </div>
          </div>

          {/* Winner Banner */}
          {tournament.winner_team && (
            <Card className="bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 border-yellow-500/50 mb-6">
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div className="flex items-center gap-4">
                    {tournament.winner_team.logo_url && (
                      <img
                        src={tournament.winner_team.logo_url}
                        alt={tournament.winner_team.name}
                        className="h-12 w-12 object-contain"
                      />
                    )}
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        CHAMPION
                      </p>
                      <p className="text-2xl font-bold">{tournament.winner_team.name}</p>
                    </div>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{teams.length}</div>
                <p className="text-sm text-muted-foreground">Teams</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{completedMatches.length}</div>
                <p className="text-sm text-muted-foreground">Matches</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CircleDot className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{totalGoals}</div>
                <p className="text-sm text-muted-foreground">Goals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-6 w-6 mx-auto mb-2 bg-yellow-500 rounded" />
                <div className="text-2xl font-bold">{totalYellowCards}</div>
                <p className="text-sm text-muted-foreground">Yellow Cards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-6 w-6 mx-auto mb-2 bg-red-500 rounded" />
                <div className="text-2xl font-bold">{totalRedCards}</div>
                <p className="text-sm text-muted-foreground">Red Cards</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="teams">Teams & Squads</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {matches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No matches recorded for this tournament
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {matches.map((match: any) => {
                  const matchEvents = getMatchEvents(match.id);
                  const goals = matchEvents.filter((e) => e.event_type === "goal");
                  const yellows = matchEvents.filter((e) => e.event_type === "yellow_card");
                  const reds = matchEvents.filter((e) => e.event_type === "red_card");
                  const subs = matchEvents.filter((e) => e.event_type === "substitution");

                  return (
                    <AccordionItem
                      key={match.id}
                      value={match.id}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground w-24">
                              {match.match_date
                                ? format(new Date(match.match_date), "MMM d, yyyy")
                                : "TBD"}
                            </div>
                            <div className="flex items-center gap-2">
                              {match.home_team?.logo_url && (
                                <img
                                  src={match.home_team.logo_url}
                                  alt=""
                                  className="h-6 w-6 object-contain"
                                />
                              )}
                              <span className="font-medium">
                                {match.home_team?.short_name || match.home_team?.name || "TBD"}
                              </span>
                            </div>
                            <span className="font-bold text-lg">
                              {match.home_score ?? "-"} - {match.away_score ?? "-"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {match.away_team?.short_name || match.away_team?.name || "TBD"}
                              </span>
                              {match.away_team?.logo_url && (
                                <img
                                  src={match.away_team.logo_url}
                                  alt=""
                                  className="h-6 w-6 object-contain"
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={match.status === "completed" ? "default" : "secondary"}>
                              {match.stage?.replace(/_/g, " ") || "Group"}
                            </Badge>
                            {hasReport(match.id) && (
                              <FileText className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        {/* Goals */}
                        {goals.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <CircleDot className="h-4 w-4" /> Goals
                            </h4>
                            <div className="space-y-1">
                              {goals.map((g: any) => (
                                <div
                                  key={g.id}
                                  className="text-sm flex items-center gap-2"
                                >
                                  <span className="text-muted-foreground w-8">
                                    {g.minute}'
                                  </span>
                                  <span>
                                    {g.player?.name || "Unknown"} ({g.team?.short_name || g.team?.name})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cards */}
                        {(yellows.length > 0 || reds.length > 0) && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Square className="h-4 w-4" /> Cards
                            </h4>
                            <div className="space-y-1">
                              {yellows.map((c: any) => (
                                <div
                                  key={c.id}
                                  className="text-sm flex items-center gap-2"
                                >
                                  <span className="text-muted-foreground w-8">
                                    {c.minute}'
                                  </span>
                                  <div className="h-3 w-2 bg-yellow-500 rounded-sm" />
                                  <span>
                                    {c.player?.name || "Unknown"} ({c.team?.short_name})
                                  </span>
                                  {c.details?.reason && (
                                    <span className="text-muted-foreground">
                                      - {c.details.reason}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {reds.map((c: any) => (
                                <div
                                  key={c.id}
                                  className="text-sm flex items-center gap-2"
                                >
                                  <span className="text-muted-foreground w-8">
                                    {c.minute}'
                                  </span>
                                  <div className="h-3 w-2 bg-red-500 rounded-sm" />
                                  <span>
                                    {c.player?.name || "Unknown"} ({c.team?.short_name})
                                  </span>
                                  {c.details?.reason && (
                                    <span className="text-muted-foreground">
                                      - {c.details.reason}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Substitutions */}
                        {subs.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ArrowRightLeft className="h-4 w-4" /> Substitutions
                            </h4>
                            <div className="space-y-1">
                              {subs.map((s: any) => (
                                <div
                                  key={s.id}
                                  className="text-sm flex items-center gap-2"
                                >
                                  <span className="text-muted-foreground w-8">
                                    {s.minute}'
                                  </span>
                                  <span className="text-red-500">
                                    {s.details?.player_out_name || s.player?.name || "Out"}
                                  </span>
                                  <ArrowRightLeft className="h-3 w-3" />
                                  <span className="text-green-500">
                                    {s.details?.player_in_name || "In"}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({s.team?.short_name})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Match info */}
                        <div className="text-sm text-muted-foreground border-t pt-3">
                          <span>Venue: {match.venue || "Not specified"}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </TabsContent>

          {/* Teams & Squads Tab */}
          <TabsContent value="teams" className="space-y-4">
            {teams.map((team: any) => {
              const teamPlayers = getTeamPlayers(team.id);
              const isExpanded = expandedTeam === team.id;

              return (
                <Card key={team.id}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {team.logo_url && (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="h-10 w-10 object-contain"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Coach: {team.coach || "Unknown"} • {teamPlayers.length} players
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      {teamPlayers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No players registered
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">#</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Position</TableHead>
                              <TableHead className="text-center">Goals</TableHead>
                              <TableHead className="text-center">Assists</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teamPlayers
                              .sort((a: any, b: any) => (a.jersey_number || 99) - (b.jersey_number || 99))
                              .map((player: any) => (
                                <TableRow key={player.id}>
                                  <TableCell className="font-medium">
                                    {player.jersey_number || "-"}
                                  </TableCell>
                                  <TableCell>{player.name}</TableCell>
                                  <TableCell>{player.position || "-"}</TableCell>
                                  <TableCell className="text-center">
                                    {player.goals || 0}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {player.assists || 0}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Top Scorers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5" /> Top Scorers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topScorers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No goals scored yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">Goals</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topScorers.map((scorer, idx) => (
                        <TableRow key={scorer.player.id}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell>{scorer.player.name}</TableCell>
                          <TableCell className="text-center font-bold">
                            {scorer.goals}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Cards Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-4 w-3 bg-yellow-500 rounded-sm" /> Yellow Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalYellowCards}</p>
                  <p className="text-sm text-muted-foreground">Total cautions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-4 w-3 bg-red-500 rounded-sm" /> Red Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalRedCards}</p>
                  <p className="text-sm text-muted-foreground">Total send-offs</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Standings Tab */}
          <TabsContent value="standings">
            <Card>
              <CardHeader>
                <CardTitle>Final Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">P</TableHead>
                      <TableHead className="text-center">W</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">GF</TableHead>
                      <TableHead className="text-center">GA</TableHead>
                      <TableHead className="text-center">GD</TableHead>
                      <TableHead className="text-center font-bold">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team: any, idx: number) => (
                      <TableRow
                        key={team.id}
                        className={team.id === tournament.winner_team_id ? "bg-yellow-500/10" : ""}
                      >
                        <TableCell className="font-medium">
                          {idx + 1}
                          {team.id === tournament.winner_team_id && (
                            <Trophy className="h-4 w-4 inline ml-1 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {team.logo_url && (
                              <img
                                src={team.logo_url}
                                alt=""
                                className="h-5 w-5 object-contain"
                              />
                            )}
                            {team.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {(team.wins || 0) + (team.draws || 0) + (team.losses || 0)}
                        </TableCell>
                        <TableCell className="text-center">{team.wins || 0}</TableCell>
                        <TableCell className="text-center">{team.draws || 0}</TableCell>
                        <TableCell className="text-center">{team.losses || 0}</TableCell>
                        <TableCell className="text-center">{team.goals_for || 0}</TableCell>
                        <TableCell className="text-center">{team.goals_against || 0}</TableCell>
                        <TableCell className="text-center">
                          {(team.goals_for || 0) - (team.goals_against || 0)}
                        </TableCell>
                        <TableCell className="text-center font-bold">{team.points || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
