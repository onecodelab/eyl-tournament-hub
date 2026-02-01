import { useState } from "react";
import { format } from "date-fns";
import { FileText, Download, Eye, Loader2, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { THOAdminLayout } from "@/components/admin/THOAdminLayout";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MatchReportWithDetails {
  id: string;
  match_id: string;
  referee_id: string;
  attendance: number | null;
  weather: string | null;
  notes: string | null;
  submitted_at: string;
  created_at: string;
  centre_referee: string | null;
  assistant_referee_1: string | null;
  assistant_referee_2: string | null;
  fourth_official: string | null;
  match_commissioner: string | null;
  home_coach: string | null;
  away_coach: string | null;
  half_time_home: number | null;
  half_time_away: number | null;
  match: {
    id: string;
    home_score: number | null;
    away_score: number | null;
    match_date: string | null;
    venue: string | null;
    status: string | null;
    tournament_id: string | null;
    home_team: { id: string; name: string; short_name: string | null; coach: string | null } | null;
    away_team: { id: string; name: string; short_name: string | null; coach: string | null } | null;
    tournament: { name: string } | null;
  } | null;
}

function useTHOMatchReports(tournamentIds: string[]) {
  return useQuery({
    queryKey: ["tho-match-reports", tournamentIds],
    queryFn: async () => {
      if (tournamentIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("match_reports")
        .select(`
          *,
          match:matches(
            id,
            home_score,
            away_score,
            match_date,
            venue,
            status,
            tournament_id,
            home_team:teams!matches_home_team_id_fkey(id, name, short_name, coach),
            away_team:teams!matches_away_team_id_fkey(id, name, short_name, coach),
            tournament:tournaments(name)
          )
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      
      // Filter to only include reports from assigned tournaments
      return (data as MatchReportWithDetails[]).filter(
        (report) => report.match?.tournament_id && tournamentIds.includes(report.match.tournament_id)
      );
    },
    enabled: tournamentIds.length > 0,
  });
}

function useRefereeEmails() {
  return useQuery({
    queryKey: ["referee-emails-tho"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_referees_with_email");
      if (error) throw error;
      return data as { user_id: string; email: string }[];
    },
  });
}

export default function THOMatchReports() {
  const { tournamentIds, assignedTournaments } = useTournamentAdmin();
  const { data: reports = [], isLoading } = useTHOMatchReports(tournamentIds);
  const { data: referees = [] } = useRefereeEmails();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<MatchReportWithDetails | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const getRefereeEmail = (refereeId: string) => {
    const referee = referees.find((r) => r.user_id === refereeId);
    return referee?.email || "Unknown";
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchQuery ||
      report.match?.home_team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.match?.away_team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRefereeEmail(report.referee_id).toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleViewReport = (report: MatchReportWithDetails) => {
    setSelectedReport(report);
  };

  const handleDownloadPDF = async (report: MatchReportWithDetails) => {
    if (!report.match) {
      toast.error("Match data not found");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const [matchResult, eventsResult, lineupsResult] = await Promise.all([
        supabase
          .from("matches")
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url, coach),
            away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url, coach),
            tournament:tournaments(id, name)
          `)
          .eq("id", report.match_id)
          .single(),
        supabase
          .from("match_events")
          .select(`
            *,
            team:teams(id, name, short_name),
            player:players(id, name, jersey_number)
          `)
          .eq("match_id", report.match_id),
        supabase
          .from("match_lineups")
          .select("*")
          .eq("match_id", report.match_id),
      ]);

      if (matchResult.error) throw matchResult.error;

      const matchData = matchResult.data;
      const lineupsData = lineupsResult.data || [];

      const [homePlayersResult, awayPlayersResult] = await Promise.all([
        matchData.home_team?.id
          ? supabase.from("players").select("id, name, jersey_number, position").eq("team_id", matchData.home_team.id)
          : Promise.resolve({ data: [] }),
        matchData.away_team?.id
          ? supabase.from("players").select("id, name, jersey_number, position").eq("team_id", matchData.away_team.id)
          : Promise.resolve({ data: [] }),
      ]);

      const homePlayers = homePlayersResult.data || [];
      const awayPlayers = awayPlayersResult.data || [];
      const allPlayers = [...homePlayers, ...awayPlayers];

      const homeLineup = lineupsData.find((l: any) => l.team_id === matchData.home_team?.id);
      const awayLineup = lineupsData.find((l: any) => l.team_id === matchData.away_team?.id);

      const getPlayerById = (playerId: string) => allPlayers.find((p: any) => p.id === playerId);

      const homeGK = homeLineup?.goalkeeper_id ? getPlayerById(homeLineup.goalkeeper_id) : null;
      const awayGK = awayLineup?.goalkeeper_id ? getPlayerById(awayLineup.goalkeeper_id) : null;
      const homeLineupPlayers = (homeLineup?.player_ids || []).map((id: string) => getPlayerById(id)).filter(Boolean);
      const awayLineupPlayers = (awayLineup?.player_ids || []).map((id: string) => getPlayerById(id)).filter(Boolean);

      const enrichedEvents = (eventsResult.data || []).map((event: any) => {
        if (event.event_type === "substitution" && event.details) {
          const playerOutId = event.details.player_out;
          const playerInId = event.details.player_in || event.player_id;
          const playerOut = playerOutId ? getPlayerById(playerOutId) : null;
          const playerIn = playerInId ? getPlayerById(playerInId) : null;

          return {
            ...event,
            details: {
              ...event.details,
              player_out_name: playerOut?.name || event.player?.name || "",
              player_out_number: playerOut?.jersey_number || event.player?.jersey_number || "",
              player_in_name: playerIn?.name || "",
              player_in_number: playerIn?.jersey_number || "",
            },
          };
        }
        return event;
      });

      const { downloadMatchReportPDF } = await import("@/utils/generateMatchPDF");

      await downloadMatchReportPDF({
        match: matchData,
        events: enrichedEvents,
        report: {
          attendance: report.attendance,
          weather: report.weather,
          notes: report.notes,
          halfTimeHome: report.half_time_home ?? null,
          halfTimeAway: report.half_time_away ?? null,
        },
        refereeEmail: getRefereeEmail(report.referee_id),
        lineups: {
          home_players: homeLineupPlayers,
          away_players: awayLineupPlayers,
          home_goalkeeper: homeGK,
          away_goalkeeper: awayGK,
        },
        officials: {
          refereeName: report.centre_referee || undefined,
          assistantRef1: report.assistant_referee_1 || undefined,
          assistantRef2: report.assistant_referee_2 || undefined,
          fourthOfficial: report.fourth_official || undefined,
          matchCommissioner: report.match_commissioner || undefined,
          homeCoach: matchData.home_team?.coach || undefined,
          awayCoach: matchData.away_team?.coach || undefined,
        },
      });

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <THOAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Match Reports</h1>
          <p className="text-muted-foreground">
            View submitted referee match reports for your tournaments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter((r) => {
                  const submitted = new Date(r.submitted_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return submitted >= weekAgo;
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedTournaments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Input
          placeholder="Search by team or referee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />

        {/* Reports Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No match reports found for your tournaments</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Referee</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {report.match?.home_team?.short_name || report.match?.home_team?.name || "TBD"} vs{" "}
                            {report.match?.away_team?.short_name || report.match?.away_team?.name || "TBD"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {report.match?.match_date
                              ? format(new Date(report.match.match_date), "MMM d, yyyy")
                              : "No date"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.match?.tournament?.name || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {report.match?.home_score ?? "-"} - {report.match?.away_score ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getRefereeEmail(report.referee_id)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {format(new Date(report.submitted_at), "MMM d, HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(report)}
                            disabled={isGeneratingPDF}
                          >
                            {isGeneratingPDF ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Report Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Match Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="font-bold text-lg">
                    {selectedReport.match?.home_team?.name || "TBD"} vs{" "}
                    {selectedReport.match?.away_team?.name || "TBD"}
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {selectedReport.match?.home_score ?? 0} - {selectedReport.match?.away_score ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedReport.match?.match_date
                      ? format(new Date(selectedReport.match.match_date), "MMMM d, yyyy • HH:mm")
                      : "No date"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Referee</label>
                    <p>{getRefereeEmail(selectedReport.referee_id)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Venue</label>
                    <p>{selectedReport.match?.venue || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Attendance</label>
                    <p>{selectedReport.attendance?.toLocaleString() || "Not recorded"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Weather</label>
                    <p>{selectedReport.weather || "Not recorded"}</p>
                  </div>
                </div>

                {selectedReport.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Referee Notes</label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-md">{selectedReport.notes}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => handleDownloadPDF(selectedReport)} disabled={isGeneratingPDF}>
                    {isGeneratingPDF ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </THOAdminLayout>
  );
}
