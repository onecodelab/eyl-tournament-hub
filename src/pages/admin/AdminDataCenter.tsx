import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTournaments, useTeams, usePlayers, useAllMatches } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EYLLogo } from "@/components/EYLLogo";
import { 
  Database, 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  AlertTriangle, 
  FileText,
  ChevronRight,
  Medal,
  Shield,
  User,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { downloadMatchReportPDF } from "@/utils/generateMatchPDF";
import { useToast } from "@/hooks/use-toast";

export default function AdminDataCenter() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { data: tournaments = [] } = useTournaments();
  const { data: allTeams = [] } = useTeams();
  const { data: allPlayers = [] } = usePlayers();
  const { data: allMatches = [] } = useAllMatches();
  const { toast } = useToast();

  // Filter data by tournament
  const teams = useMemo(() => 
    allTeams.filter(t => t.tournament_id === selectedTournamentId),
    [allTeams, selectedTournamentId]
  );

  const matches = useMemo(() => 
    allMatches.filter(m => m.tournament_id === selectedTournamentId),
    [allMatches, selectedTournamentId]
  );

  const players = useMemo(() => {
    const teamIds = teams.map(t => t.id);
    return allPlayers.filter(p => teamIds.includes(p.team_id || ""));
  }, [allPlayers, teams]);

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);
  const winnerTeam = teams.find(t => t.id === selectedTournament?.winner_team_id);

  // Fetch match events for the tournament
  const { data: matchEvents = [] } = useQuery({
    queryKey: ["tournament-match-events", selectedTournamentId],
    queryFn: async () => {
      if (!selectedTournamentId) return [];
      const matchIds = matches.map(m => m.id);
      if (matchIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("match_events")
        .select("*")
        .in("match_id", matchIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTournamentId && matches.length > 0,
  });

  // Fetch match reports
  const { data: matchReports = [] } = useQuery({
    queryKey: ["tournament-match-reports", selectedTournamentId],
    queryFn: async () => {
      if (!selectedTournamentId) return [];
      const matchIds = matches.map(m => m.id);
      if (matchIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("match_reports")
        .select("*")
        .in("match_id", matchIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTournamentId && matches.length > 0,
  });

  // Fetch lineups
  const { data: matchLineups = [] } = useQuery({
    queryKey: ["tournament-lineups", selectedTournamentId],
    queryFn: async () => {
      if (!selectedTournamentId) return [];
      const matchIds = matches.map(m => m.id);
      if (matchIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("match_lineups")
        .select("*")
        .in("match_id", matchIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTournamentId && matches.length > 0,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const goals = matchEvents.filter(e => e.event_type === "goal");
    const yellowCards = matchEvents.filter(e => e.event_type === "yellow_card");
    const redCards = matchEvents.filter(e => e.event_type === "red_card");
    const completedMatches = matches.filter(m => m.status === "completed");
    
    // Top scorers
    const scorerMap: Record<string, number> = {};
    goals.forEach(g => {
      if (g.player_id) {
        scorerMap[g.player_id] = (scorerMap[g.player_id] || 0) + 1;
      }
    });
    
    const topScorers = Object.entries(scorerMap)
      .map(([playerId, goalCount]) => ({
        player: players.find(p => p.id === playerId),
        goals: goalCount,
      }))
      .filter(s => s.player)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);

    return {
      totalMatches: matches.length,
      completedMatches: completedMatches.length,
      totalGoals: goals.length,
      totalYellowCards: yellowCards.length,
      totalRedCards: redCards.length,
      totalTeams: teams.length,
      totalPlayers: players.length,
      reportsSubmitted: matchReports.length,
      topScorers,
    };
  }, [matchEvents, matches, teams, players, matchReports]);

  // Get match details for dialog
  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  const selectedMatchEvents = matchEvents.filter(e => e.match_id === selectedMatchId);
  const selectedMatchLineups = matchLineups.filter(l => l.match_id === selectedMatchId);
  const selectedMatchReport = matchReports.find(r => r.match_id === selectedMatchId);

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return "TBD";
    const team = teams.find(t => t.id === teamId);
    return team?.name || "Unknown";
  };

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return "Unknown";
    const player = players.find(p => p.id === playerId);
    return player?.name || "Unknown";
  };

  const handleDownloadReport = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    const report = matchReports.find(r => r.match_id === matchId);
    const events = matchEvents.filter(e => e.match_id === matchId);
    const lineups = matchLineups.filter(l => l.match_id === matchId);
    
    if (!match || !report) {
      toast({ title: "Error", description: "Match report not found", variant: "destructive" });
      return;
    }

    const homeTeam = teams.find(t => t.id === match.home_team_id);
    const awayTeam = teams.find(t => t.id === match.away_team_id);
    
    // Find lineups for each team
    const homeLineup = lineups.find(l => l.team_id === match.home_team_id);
    const awayLineup = lineups.find(l => l.team_id === match.away_team_id);
    
    // Resolve player IDs to player objects
    const getPlayerById = (playerId: string) => players.find(p => p.id === playerId);
    
    const homeGK = homeLineup?.goalkeeper_id ? getPlayerById(homeLineup.goalkeeper_id) : null;
    const awayGK = awayLineup?.goalkeeper_id ? getPlayerById(awayLineup.goalkeeper_id) : null;
    const homeLineupPlayers = (homeLineup?.player_ids || []).map(id => getPlayerById(id)).filter(Boolean);
    const awayLineupPlayers = (awayLineup?.player_ids || []).map(id => getPlayerById(id)).filter(Boolean);

    // Enrich events with player and team info
    const enrichedEvents = events.map(event => {
      const player = event.player_id ? getPlayerById(event.player_id) : null;
      const team = event.team_id ? teams.find(t => t.id === event.team_id) : null;
      
      if (event.event_type === "substitution" && event.details) {
        const details = event.details as { player_out?: string; player_in?: string };
        const playerOut = details.player_out ? getPlayerById(details.player_out) : null;
        const playerIn = details.player_in ? getPlayerById(details.player_in) : player;
        
        return {
          ...event,
          player: player ? { name: player.name, jersey_number: player.jersey_number } : null,
          team: team ? { name: team.name, short_name: team.short_name } : null,
          details: {
            ...details,
            player_out_name: playerOut?.name || "",
            player_out_number: playerOut?.jersey_number || "",
            player_in_name: playerIn?.name || "",
            player_in_number: playerIn?.jersey_number || "",
          },
        };
      }
      
      return {
        ...event,
        player: player ? { name: player.name, jersey_number: player.jersey_number } : null,
        team: team ? { name: team.name, short_name: team.short_name } : null,
      };
    });

    await downloadMatchReportPDF({
      match: {
        ...match,
        home_team: homeTeam ? { name: homeTeam.name, short_name: homeTeam.short_name, coach: homeTeam.coach, logo_url: homeTeam.logo_url } : null,
        away_team: awayTeam ? { name: awayTeam.name, short_name: awayTeam.short_name, coach: awayTeam.coach, logo_url: awayTeam.logo_url } : null,
        tournament: selectedTournament ? { name: selectedTournament.name } : null,
      },
      events: enrichedEvents,
      report: {
        attendance: report.attendance,
        weather: report.weather,
        notes: report.notes,
        halfTimeHome: (report as any).half_time_home ?? null,
        halfTimeAway: (report as any).half_time_away ?? null,
      },
      lineups: {
        home_players: homeLineupPlayers as any,
        away_players: awayLineupPlayers as any,
        home_goalkeeper: homeGK as any,
        away_goalkeeper: awayGK as any,
      },
      officials: {
        refereeName: (report as any).centre_referee || undefined,
        assistantRef1: (report as any).assistant_referee_1 || undefined,
        assistantRef2: (report as any).assistant_referee_2 || undefined,
        fourthOfficial: (report as any).fourth_official || undefined,
        matchCommissioner: (report as any).match_commissioner || undefined,
        homeCoach: homeTeam?.coach || undefined,
        awayCoach: awayTeam?.coach || undefined,
      },
    });
    
    toast({ title: "Success", description: "Report downloaded" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Data Center</h1>
              <p className="text-muted-foreground">Complete tournament archive & history</p>
            </div>
          </div>
          
          <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {t.name}
                    {t.status === "completed" && (
                      <Badge variant="secondary" className="text-xs">Completed</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedTournamentId ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a Tournament</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Choose a tournament from the dropdown above to view its complete history, 
                match results, teams, squads, and referee reports.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tournament Overview */}
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedTournament?.logo_url ? (
                      <img src={selectedTournament.logo_url} alt="" className="h-12 w-12 object-contain" />
                    ) : (
                      <Trophy className="h-12 w-12 text-primary" />
                    )}
                    <div>
                      <CardTitle className="text-xl">{selectedTournament?.name}</CardTitle>
                      <CardDescription>
                        {selectedTournament?.age_category && `${selectedTournament.age_category} • `}
                        {selectedTournament?.format?.replace("_", " + ")}
                        {selectedTournament?.status && (
                          <Badge variant="outline" className="ml-2">{selectedTournament.status}</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {winnerTeam && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <Medal className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                        Winner: {winnerTeam.name}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  <StatCard label="Teams" value={stats.totalTeams} icon={Users} />
                  <StatCard label="Players" value={stats.totalPlayers} icon={User} />
                  <StatCard label="Matches" value={stats.totalMatches} icon={Calendar} />
                  <StatCard label="Completed" value={stats.completedMatches} icon={Shield} />
                  <StatCard label="Goals" value={stats.totalGoals} icon={Target} />
                  <StatCard label="Yellow Cards" value={stats.totalYellowCards} icon={AlertTriangle} color="yellow" />
                  <StatCard label="Red Cards" value={stats.totalRedCards} icon={AlertTriangle} color="red" />
                  <StatCard label="Reports" value={stats.reportsSubmitted} icon={FileText} />
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different data views */}
            <Tabs defaultValue="matches" className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full max-w-2xl">
                <TabsTrigger value="matches" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Matches
                </TabsTrigger>
                <TabsTrigger value="teams" className="gap-2">
                  <Users className="h-4 w-4" />
                  Teams
                </TabsTrigger>
                <TabsTrigger value="scorers" className="gap-2">
                  <Target className="h-4 w-4" />
                  Scorers
                </TabsTrigger>
                <TabsTrigger value="cards" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Reports
                </TabsTrigger>
              </TabsList>

              {/* Matches Tab */}
              <TabsContent value="matches">
                <Card>
                  <CardHeader>
                    <CardTitle>All Matches</CardTitle>
                    <CardDescription>Complete match results with scores and details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matches.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No matches scheduled yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Match</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead>Venue</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matches.map((match) => (
                            <TableRow key={match.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="text-sm">
                                {match.match_date ? format(new Date(match.match_date), "MMM d, yyyy") : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {match.stage?.replace("_", " ") || "Group"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                {match.status === "completed" ? (
                                  <span className="text-primary">
                                    {match.home_score} - {match.away_score}
                                  </span>
                                ) : "-"}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {match.venue || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={match.status === "completed" ? "secondary" : "outline"}>
                                  {match.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedMatchId(match.id)}
                                >
                                  Details <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Teams & Squads Tab */}
              <TabsContent value="teams">
                <Card>
                  <CardHeader>
                    <CardTitle>Teams & Squads</CardTitle>
                    <CardDescription>All teams and their complete rosters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teams.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No teams in this tournament</p>
                    ) : (
                      <Accordion type="single" collapsible className="space-y-2">
                        {teams.map((team) => {
                          const teamPlayers = players.filter(p => p.team_id === team.id);
                          return (
                            <AccordionItem key={team.id} value={team.id} className="border rounded-lg px-4">
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                  {team.logo_url ? (
                                    <img src={team.logo_url} alt="" className="h-8 w-8 object-contain" />
                                  ) : (
                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                      <Users className="h-4 w-4" />
                                    </div>
                                  )}
                                  <div className="text-left">
                                    <p className="font-semibold">{team.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {teamPlayers.length} players • {team.coach || "No coach"}
                                      {team.group_name && ` • Group ${team.group_name}`}
                                    </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                  {/* Team Stats */}
                                  <div className="p-4 rounded-lg bg-muted/30">
                                    <h4 className="font-medium mb-3">Season Stats</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                      <div>
                                        <p className="text-2xl font-bold text-green-500">{team.wins || 0}</p>
                                        <p className="text-xs text-muted-foreground">Wins</p>
                                      </div>
                                      <div>
                                        <p className="text-2xl font-bold text-yellow-500">{team.draws || 0}</p>
                                        <p className="text-xs text-muted-foreground">Draws</p>
                                      </div>
                                      <div>
                                        <p className="text-2xl font-bold text-red-500">{team.losses || 0}</p>
                                        <p className="text-xs text-muted-foreground">Losses</p>
                                      </div>
                                    </div>
                                    <div className="flex justify-between mt-4 pt-4 border-t">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Goals For</p>
                                        <p className="font-bold">{team.goals_for || 0}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Goals Against</p>
                                        <p className="font-bold">{team.goals_against || 0}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Points</p>
                                        <p className="font-bold text-primary">{team.points || 0}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Squad */}
                                  <div className="p-4 rounded-lg bg-muted/30">
                                    <h4 className="font-medium mb-3">Squad ({teamPlayers.length})</h4>
                                    <ScrollArea className="h-[200px]">
                                      <div className="space-y-2">
                                        {teamPlayers.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">No players registered</p>
                                        ) : (
                                          teamPlayers.map((player) => (
                                            <div key={player.id} className="flex items-center justify-between text-sm">
                                              <div className="flex items-center gap-2">
                                                <span className="w-6 text-center font-mono text-muted-foreground">
                                                  {player.jersey_number || "-"}
                                                </span>
                                                <span>{player.name}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-muted-foreground">
                                                <Badge variant="outline" className="text-xs">
                                                  {player.position || "Player"}
                                                </Badge>
                                                <span className="text-xs">
                                                  {player.goals || 0}G / {player.assists || 0}A
                                                </span>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Top Scorers Tab */}
              <TabsContent value="scorers">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Scorers</CardTitle>
                    <CardDescription>Players with most goals in this tournament</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.topScorers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No goals scored yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead className="text-center">Goals</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.topScorers.map((scorer, index) => (
                            <TableRow key={scorer.player?.id}>
                              <TableCell>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? "bg-yellow-500 text-yellow-900" :
                                  index === 1 ? "bg-gray-300 text-gray-700" :
                                  index === 2 ? "bg-amber-600 text-white" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {index + 1}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {scorer.player?.photo_url && (
                                    <img src={scorer.player.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                                  )}
                                  {scorer.player?.name}
                                </div>
                              </TableCell>
                              <TableCell>{getTeamName(scorer.player?.team_id || null)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{scorer.player?.position || "Player"}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-xl font-bold text-primary">{scorer.goals}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cards Tab */}
              <TabsContent value="cards">
                <Card>
                  <CardHeader>
                    <CardTitle>Disciplinary Record</CardTitle>
                    <CardDescription>All yellow and red cards issued</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matchEvents.filter(e => ["yellow_card", "red_card"].includes(e.event_type)).length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No cards issued yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Match</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Minute</TableHead>
                            <TableHead>Card</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matchEvents
                            .filter(e => ["yellow_card", "red_card"].includes(e.event_type))
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((event) => {
                              const match = matches.find(m => m.id === event.match_id);
                              const details = event.details as { reason?: string } | null;
                              return (
                                <TableRow key={event.id}>
                                  <TableCell className="text-sm">
                                    {getTeamName(match?.home_team_id || null)} vs {getTeamName(match?.away_team_id || null)}
                                  </TableCell>
                                  <TableCell className="font-medium">{getPlayerName(event.player_id)}</TableCell>
                                  <TableCell>{getTeamName(event.team_id)}</TableCell>
                                  <TableCell>{event.minute}'</TableCell>
                                  <TableCell>
                                    <div className={`w-5 h-7 rounded-sm ${
                                      event.event_type === "yellow_card" ? "bg-yellow-400" : "bg-red-500"
                                    }`} />
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {details?.reason || "-"}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Referee Reports</CardTitle>
                    <CardDescription>Download official match reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matchReports.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No reports submitted yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Match</TableHead>
                            <TableHead>Referee</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Download</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matchReports.map((report) => {
                            const match = matches.find(m => m.id === report.match_id);
                            return (
                              <TableRow key={report.id}>
                                <TableCell>
                                  {match?.match_date ? format(new Date(match.match_date), "MMM d, yyyy") : "-"}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {getTeamName(match?.home_team_id || null)} vs {getTeamName(match?.away_team_id || null)}
                                </TableCell>
                                <TableCell>{report.centre_referee || "-"}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {format(new Date(report.submitted_at), "MMM d, yyyy HH:mm")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownloadReport(report.match_id)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    PDF
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Match Detail Dialog */}
        <Dialog open={!!selectedMatchId} onOpenChange={() => setSelectedMatchId(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Match Details</DialogTitle>
            </DialogHeader>
            
            {selectedMatch && (
              <div className="space-y-6">
                {/* Match Header */}
                <div className="text-center py-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedMatch.match_date ? format(new Date(selectedMatch.match_date), "EEEE, MMMM d, yyyy") : "Date TBD"}
                  </p>
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold">{getTeamName(selectedMatch.home_team_id)}</p>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {selectedMatch.status === "completed" ? (
                        `${selectedMatch.home_score} - ${selectedMatch.away_score}`
                      ) : (
                        "vs"
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold">{getTeamName(selectedMatch.away_team_id)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{selectedMatch.venue || "Venue TBD"}</p>
                </div>

                {/* Match Events */}
                {selectedMatchEvents.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Match Events</h4>
                    <div className="space-y-2">
                      {selectedMatchEvents
                        .sort((a, b) => a.minute - b.minute)
                        .map((event) => {
                          const isHome = event.team_id === selectedMatch.home_team_id;
                          return (
                            <div 
                              key={event.id}
                              className={`flex items-center gap-2 p-2 rounded ${isHome ? "bg-blue-500/10" : "bg-red-500/10"}`}
                            >
                              <span className="w-8 text-sm font-mono">{event.minute}'</span>
                              <span className="flex-1">
                                {getPlayerName(event.player_id)} ({getTeamName(event.team_id)})
                              </span>
                              <Badge variant={
                                event.event_type === "goal" ? "default" :
                                event.event_type === "yellow_card" ? "outline" :
                                "destructive"
                              }>
                                {event.event_type.replace("_", " ")}
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Report Info */}
                {selectedMatchReport && (
                  <div>
                    <h4 className="font-semibold mb-3">Report Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Referee</p>
                        <p className="font-medium">{selectedMatchReport.centre_referee || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Attendance</p>
                        <p className="font-medium">{selectedMatchReport.attendance || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weather</p>
                        <p className="font-medium">{selectedMatchReport.weather || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Half-time</p>
                        <p className="font-medium">
                          {selectedMatchReport.half_time_home ?? "-"} - {selectedMatchReport.half_time_away ?? "-"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleDownloadReport(selectedMatch.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Full Report
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon,
  color = "default"
}: { 
  label: string; 
  value: number; 
  icon: any;
  color?: "default" | "yellow" | "red";
}) {
  const colorClasses = {
    default: "text-primary",
    yellow: "text-yellow-500",
    red: "text-red-500",
  };

  return (
    <div className="p-3 rounded-lg bg-card border text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${colorClasses[color]}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
