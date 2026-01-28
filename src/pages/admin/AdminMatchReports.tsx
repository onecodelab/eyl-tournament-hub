import { useState } from "react";
import { format } from "date-fns";
import { FileText, Download, Eye, Loader2, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  match: {
    id: string;
    home_score: number | null;
    away_score: number | null;
    match_date: string | null;
    venue: string | null;
    status: string | null;
    home_team: { name: string; short_name: string | null } | null;
    away_team: { name: string; short_name: string | null } | null;
    tournament: { name: string } | null;
  } | null;
}

function useAllMatchReports() {
  return useQuery({
    queryKey: ["all-match-reports"],
    queryFn: async () => {
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
            home_team:teams!matches_home_team_id_fkey(name, short_name),
            away_team:teams!matches_away_team_id_fkey(name, short_name),
            tournament:tournaments(name)
          )
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as MatchReportWithDetails[];
    },
  });
}

function useRefereeEmails() {
  return useQuery({
    queryKey: ["referee-emails-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_referees_with_email");
      if (error) throw error;
      return data as { user_id: string; email: string }[];
    },
  });
}

function useTournaments() {
  return useQuery({
    queryKey: ["tournaments-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export default function AdminMatchReports() {
  const { data: reports = [], isLoading } = useAllMatchReports();
  const { data: referees = [] } = useRefereeEmails();
  const { data: tournaments = [] } = useTournaments();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");
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

    const matchesTournament =
      tournamentFilter === "all" ||
      report.match?.tournament?.name === tournaments.find(t => t.id === tournamentFilter)?.name;

    return matchesSearch && matchesTournament;
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
      // Fetch full match data, events, lineups, and players for PDF generation
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

      // Fetch players for both teams to resolve lineups and event player names
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

      // Find lineup data for each team
      const homeLineup = lineupsData.find((l: any) => l.team_id === matchData.home_team?.id);
      const awayLineup = lineupsData.find((l: any) => l.team_id === matchData.away_team?.id);

      // Resolve player IDs to player objects
      const getPlayerById = (playerId: string) => allPlayers.find((p: any) => p.id === playerId);

      const homeGK = homeLineup?.goalkeeper_id ? getPlayerById(homeLineup.goalkeeper_id) : null;
      const awayGK = awayLineup?.goalkeeper_id ? getPlayerById(awayLineup.goalkeeper_id) : null;
      const homeLineupPlayers = (homeLineup?.player_ids || []).map((id: string) => getPlayerById(id)).filter(Boolean);
      const awayLineupPlayers = (awayLineup?.player_ids || []).map((id: string) => getPlayerById(id)).filter(Boolean);

      // Enrich substitution events with player names
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
        },
        refereeEmail: getRefereeEmail(report.referee_id),
        lineups: {
          home_players: homeLineupPlayers,
          away_players: awayLineupPlayers,
          home_goalkeeper: homeGK,
          away_goalkeeper: awayGK,
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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Match Reports</h1>
          <p className="text-muted-foreground">
            View all submitted referee match reports
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
                Unique Referees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(reports.map((r) => r.referee_id)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by team or referee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-sm"
          />
          <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="Filter by tournament" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tournaments</SelectItem>
              {tournaments.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                <p>No match reports found</p>
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
                    <label className="text-sm font-medium text-muted-foreground">
                      Referee
                    </label>
                    <p>{getRefereeEmail(selectedReport.referee_id)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Venue
                    </label>
                    <p>{selectedReport.match?.venue || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Attendance
                    </label>
                    <p>{selectedReport.attendance?.toLocaleString() || "Not recorded"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Weather
                    </label>
                    <p className="capitalize">{selectedReport.weather || "Not recorded"}</p>
                  </div>
                </div>

                {selectedReport.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Referee Notes
                    </label>
                    <p className="bg-muted rounded p-3 mt-1 text-sm">
                      {selectedReport.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    Close
                  </Button>
                  <Button onClick={() => handleDownloadPDF(selectedReport)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
