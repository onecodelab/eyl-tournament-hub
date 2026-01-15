import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CircleDot,
  Square,
  ArrowRightLeft,
  FileText,
  Download,
  CheckCircle,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Eye,
  Loader2,
  Users,
  Edit2,
  Save,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  useMatchById,
  useMatchEvents,
  useMatchReport,
  useMatchLineups,
  useTeamPlayers,
  useSubmitMatchReport,
} from "@/hooks/useRefereeMatches";
import { useAuth } from "@/contexts/AuthContext";

const WEATHER_OPTIONS = [
  { value: "sunny", label: "Sunny", icon: Sun },
  { value: "cloudy", label: "Cloudy", icon: Cloud },
  { value: "rainy", label: "Rainy", icon: CloudRain },
  { value: "windy", label: "Windy", icon: Wind },
];

export default function MatchReport() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: match, isLoading: matchLoading } = useMatchById(matchId || "");
  const { data: events = [] } = useMatchEvents(matchId || "");
  const { data: existingReport } = useMatchReport(matchId || "");
  const { data: lineups = [] } = useMatchLineups(matchId || "");
  const { data: homePlayers = [] } = useTeamPlayers(match?.home_team?.id);
  const { data: awayPlayers = [] } = useTeamPlayers(match?.away_team?.id);
  const submitReport = useSubmitMatchReport();

  // Form state
  const [attendance, setAttendance] = useState<string>("");
  const [weather, setWeather] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Match officials state
  const [refereeName, setRefereeName] = useState("");
  const [assistantRef1, setAssistantRef1] = useState("");
  const [assistantRef2, setAssistantRef2] = useState("");
  const [fourthOfficial, setFourthOfficial] = useState("");
  const [matchCommissioner, setMatchCommissioner] = useState("");

  // Club officials state
  const [homeCoach, setHomeCoach] = useState("");
  const [awayCoach, setAwayCoach] = useState("");

  // Half-time score
  const [halfTimeHome, setHalfTimeHome] = useState<string>("");
  const [halfTimeAway, setHalfTimeAway] = useState<string>("");

  // Load existing report data
  useEffect(() => {
    if (existingReport) {
      setAttendance(existingReport.attendance?.toString() || "");
      setWeather(existingReport.weather || "");
      setNotes(existingReport.notes || "");
      setIsSubmitted(true);
    }
  }, [existingReport]);

  // Load team coach info
  useEffect(() => {
    if (match) {
      setHomeCoach((match.home_team as any)?.coach || "");
      setAwayCoach((match.away_team as any)?.coach || "");
    }
  }, [match]);

  // Get lineup data
  const homeLineup = lineups.find((l) => l.team_id === match?.home_team?.id);
  const awayLineup = lineups.find((l) => l.team_id === match?.away_team?.id);

  const getPlayerById = (playerId: string, teamPlayers: any[]) => {
    return teamPlayers.find((p) => p.id === playerId);
  };

  // Categorize events
  const eventSummary = useMemo(() => {
    const goals = events.filter((e: any) => e.event_type === "goal");
    const yellowCards = events.filter((e: any) => e.event_type === "yellow_card");
    const redCards = events.filter((e: any) => e.event_type === "red_card");
    const substitutions = events.filter((e: any) => e.event_type === "substitution");

    return { goals, yellowCards, redCards, substitutions };
  }, [events]);

  const handleSubmit = async () => {
    if (!matchId) return;

    try {
      await submitReport.mutateAsync({
        match_id: matchId,
        attendance: attendance ? parseInt(attendance) : undefined,
        weather: weather || undefined,
        notes: notes || undefined,
      });
      setIsSubmitted(true);
      setIsEditing(false);
      toast.success("Match report submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit report");
    }
  };

  const handleDownloadPDF = async () => {
    if (!match) return;

    setIsGeneratingPDF(true);
    try {
      const { downloadMatchReportPDF } = await import("@/utils/generateMatchPDF");
      
      // Build lineup data
      const homeGK = homeLineup?.goalkeeper_id 
        ? getPlayerById(homeLineup.goalkeeper_id, homePlayers)
        : null;
      const awayGK = awayLineup?.goalkeeper_id
        ? getPlayerById(awayLineup.goalkeeper_id, awayPlayers)
        : null;
      const homeLineupPlayers = (homeLineup?.player_ids || [])
        .map((id: string) => getPlayerById(id, homePlayers))
        .filter(Boolean);
      const awayLineupPlayers = (awayLineup?.player_ids || [])
        .map((id: string) => getPlayerById(id, awayPlayers))
        .filter(Boolean);

      await downloadMatchReportPDF({
        match: {
          id: match.id,
          home_team: match.home_team,
          away_team: match.away_team,
          home_score: match.home_score,
          away_score: match.away_score,
          match_date: match.match_date,
          venue: match.venue,
          tournament: match.tournament,
          stage: match.stage,
        },
        events: events,
        report: {
          attendance: attendance ? parseInt(attendance) : null,
          weather: weather || null,
          notes: notes || null,
        },
        refereeEmail: refereeName || user?.email || undefined,
        lineups: {
          home_goalkeeper: homeGK,
          away_goalkeeper: awayGK,
          home_players: homeLineupPlayers,
          away_players: awayLineupPlayers,
        },
      });
      toast.success("PDF report downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!match) return;

    setIsGeneratingPDF(true);
    try {
      const { generateMatchReportPDF } = await import("@/utils/generateMatchPDF");
      
      // Build lineup data
      const homeGK = homeLineup?.goalkeeper_id 
        ? getPlayerById(homeLineup.goalkeeper_id, homePlayers)
        : null;
      const awayGK = awayLineup?.goalkeeper_id
        ? getPlayerById(awayLineup.goalkeeper_id, awayPlayers)
        : null;
      const homeLineupPlayers = (homeLineup?.player_ids || [])
        .map((id: string) => getPlayerById(id, homePlayers))
        .filter(Boolean);
      const awayLineupPlayers = (awayLineup?.player_ids || [])
        .map((id: string) => getPlayerById(id, awayPlayers))
        .filter(Boolean);

      const blob = await generateMatchReportPDF({
        match: {
          id: match.id,
          home_team: match.home_team,
          away_team: match.away_team,
          home_score: match.home_score,
          away_score: match.away_score,
          match_date: match.match_date,
          venue: match.venue,
          tournament: match.tournament,
          stage: match.stage,
        },
        events: events,
        report: {
          attendance: attendance ? parseInt(attendance) : null,
          weather: weather || null,
          notes: notes || null,
        },
        refereeEmail: refereeName || user?.email || undefined,
        lineups: {
          home_goalkeeper: homeGK,
          away_goalkeeper: awayGK,
          home_players: homeLineupPlayers,
          away_players: awayLineupPlayers,
        },
      });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error("PDF preview error:", error);
      toast.error("Failed to generate PDF preview");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  if (matchLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Match Not Found</h1>
          <Button onClick={() => navigate("/referee")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const canEdit = !isSubmitted || isEditing;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/referee/match/${matchId}`)}>
            ← Back to Match
          </Button>
          {isSubmitted && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Report
            </Button>
          )}
        </div>

        {/* Final Score Display */}
        <Card className="mb-6 bg-gradient-to-r from-green-500/10 via-background to-green-500/10">
          <CardContent className="py-8 text-center">
            <Badge className="mb-4 bg-green-500">Match Completed</Badge>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                {match.home_team?.logo_url && (
                  <img
                    src={match.home_team.logo_url}
                    alt=""
                    className="h-16 w-16 mx-auto object-contain mb-2"
                  />
                )}
                <p className="font-bold text-lg">{match.home_team?.name || "Home"}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold">
                  {match.home_score ?? 0} - {match.away_score ?? 0}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  (HT: {halfTimeHome || "-"} - {halfTimeAway || "-"})
                </div>
              </div>
              <div className="text-center">
                {match.away_team?.logo_url && (
                  <img
                    src={match.away_team.logo_url}
                    alt=""
                    className="h-16 w-16 mx-auto object-contain mb-2"
                  />
                )}
                <p className="font-bold text-lg">{match.away_team?.name || "Away"}</p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4">
              {match.match_date && format(new Date(match.match_date), "MMMM d, yyyy • HH:mm")}
              {match.venue && ` • ${match.venue}`}
            </p>
          </CardContent>
        </Card>

        {/* Accordion sections for the report */}
        <Accordion type="multiple" defaultValue={["officials", "details", "events"]} className="space-y-4">
          
          {/* Match Officials */}
          <AccordionItem value="officials" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Match Officials
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Centre Referee</Label>
                  <Input
                    placeholder="Referee name"
                    value={refereeName}
                    onChange={(e) => setRefereeName(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Assistant Referee 1</Label>
                  <Input
                    placeholder="AR1 name"
                    value={assistantRef1}
                    onChange={(e) => setAssistantRef1(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Assistant Referee 2</Label>
                  <Input
                    placeholder="AR2 name"
                    value={assistantRef2}
                    onChange={(e) => setAssistantRef2(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Fourth Official</Label>
                  <Input
                    placeholder="Fourth Official name"
                    value={fourthOfficial}
                    onChange={(e) => setFourthOfficial(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Match Commissioner</Label>
                  <Input
                    placeholder="Commissioner name"
                    value={matchCommissioner}
                    onChange={(e) => setMatchCommissioner(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                <div>
                  <Label>{match.home_team?.name} Coach</Label>
                  <Input
                    placeholder="Home team coach"
                    value={homeCoach}
                    onChange={(e) => setHomeCoach(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>{match.away_team?.name} Coach</Label>
                  <Input
                    placeholder="Away team coach"
                    value={awayCoach}
                    onChange={(e) => setAwayCoach(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Match Details */}
          <AccordionItem value="details" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Match Details
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Attendance</Label>
                  <Input
                    type="number"
                    placeholder="Spectators"
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Weather</Label>
                  <Select value={weather} onValueChange={setWeather} disabled={!canEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select weather" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEATHER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Half-time (Home)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={halfTimeHome}
                    onChange={(e) => setHalfTimeHome(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Half-time (Away)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={halfTimeAway}
                    onChange={(e) => setHalfTimeAway(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Match Events */}
          <AccordionItem value="events" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              Match Events Summary
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-6">
              {/* Goals */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <CircleDot className="h-4 w-4 text-green-500" />
                  Goals ({eventSummary.goals.length})
                </Label>
                {eventSummary.goals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No goals scored</p>
                ) : (
                  <div className="space-y-1">
                    {eventSummary.goals.map((goal: any) => (
                      <div key={goal.id} className="text-sm flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <span className="font-mono w-10 font-bold">{goal.minute}'</span>
                        <CircleDot className="h-4 w-4 text-green-500" />
                        <span className="flex-1">
                          {goal.player?.name || "Unknown"} ({goal.team?.short_name || goal.team?.name})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Yellow Cards */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Square className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  Yellow Cards ({eventSummary.yellowCards.length})
                </Label>
                {eventSummary.yellowCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No yellow cards</p>
                ) : (
                  <div className="space-y-1">
                    {eventSummary.yellowCards.map((card: any) => (
                      <div key={card.id} className="text-sm flex items-center gap-2 p-2 bg-yellow-500/10 rounded">
                        <span className="font-mono w-10 font-bold">{card.minute}'</span>
                        <Square className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="flex-1">
                          {card.player?.name || "Unknown"} ({card.team?.short_name || card.team?.name})
                        </span>
                        {card.details?.reason && (
                          <Badge variant="outline" className="text-xs">
                            {card.details.reason}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Red Cards */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Square className="h-4 w-4 text-red-500 fill-red-500" />
                  Red Cards ({eventSummary.redCards.length})
                </Label>
                {eventSummary.redCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No red cards</p>
                ) : (
                  <div className="space-y-1">
                    {eventSummary.redCards.map((card: any) => (
                      <div key={card.id} className="text-sm flex items-center gap-2 p-2 bg-red-500/10 rounded">
                        <span className="font-mono w-10 font-bold">{card.minute}'</span>
                        <Square className="h-4 w-4 text-red-500 fill-red-500" />
                        <span className="flex-1">
                          {card.player?.name || "Unknown"} ({card.team?.short_name || card.team?.name})
                        </span>
                        {card.details?.reason && (
                          <Badge variant="outline" className="text-xs border-red-500/50">
                            {card.details.reason}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Substitutions */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                  Substitutions ({eventSummary.substitutions.length})
                </Label>
                {eventSummary.substitutions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No substitutions</p>
                ) : (
                  <div className="space-y-1">
                    {eventSummary.substitutions.map((sub: any) => {
                      const teamPlayers = sub.team?.name === match.home_team?.name ? homePlayers : awayPlayers;
                      const playerIn = sub.details?.player_in 
                        ? getPlayerById(sub.details.player_in, teamPlayers)
                        : null;
                      
                      return (
                        <div key={sub.id} className="text-sm flex items-center gap-2 p-2 bg-blue-500/10 rounded">
                          <span className="font-mono w-10 font-bold">{sub.minute}'</span>
                          <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                          <span className="text-red-500">
                            ↓ {sub.player?.name || "Unknown"}
                          </span>
                          <span className="text-green-500">
                            ↑ {playerIn?.name || "Unknown"}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ({sub.team?.short_name || sub.team?.name})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Team Sheets */}
          <AccordionItem value="teamsheets" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              Team Sheets
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Home Team */}
                <div>
                  <h4 className="font-semibold mb-2">{match.home_team?.name}</h4>
                  <div className="space-y-1">
                    {homeLineup?.goalkeeper_id && (
                      <div className="text-sm p-1 bg-amber-500/10 rounded">
                        GK: {getPlayerById(homeLineup.goalkeeper_id, homePlayers)?.name || "Unknown"} 
                        (#{getPlayerById(homeLineup.goalkeeper_id, homePlayers)?.jersey_number})
                      </div>
                    )}
                    {(homeLineup?.player_ids || []).map((playerId: string) => {
                      const player = getPlayerById(playerId, homePlayers);
                      return player ? (
                        <div key={playerId} className="text-sm p-1">
                          #{player.jersey_number} {player.name} ({player.position})
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Away Team */}
                <div>
                  <h4 className="font-semibold mb-2">{match.away_team?.name}</h4>
                  <div className="space-y-1">
                    {awayLineup?.goalkeeper_id && (
                      <div className="text-sm p-1 bg-amber-500/10 rounded">
                        GK: {getPlayerById(awayLineup.goalkeeper_id, awayPlayers)?.name || "Unknown"}
                        (#{getPlayerById(awayLineup.goalkeeper_id, awayPlayers)?.jersey_number})
                      </div>
                    )}
                    {(awayLineup?.player_ids || []).map((playerId: string) => {
                      const player = getPlayerById(playerId, awayPlayers);
                      return player ? (
                        <div key={playerId} className="text-sm p-1">
                          #{player.jersey_number} {player.name} ({player.position})
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Referee Notes */}
          <AccordionItem value="notes" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              Referee Notes & Observations
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <Textarea
                placeholder="Add any additional comments about the match, incidents, or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canEdit}
                rows={6}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="flex gap-3 justify-end flex-wrap mt-6">
          <Button variant="outline" onClick={() => navigate("/referee")}>
            Cancel
          </Button>
          
          {(isSubmitted || isEditing) && (
            <>
              <Button 
                variant="outline" 
                onClick={handlePreviewPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Preview PDF
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-[#0E1B31] hover:bg-[#0E1B31]/90"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download PDF
              </Button>
            </>
          )}
          
          {canEdit && (
            <Button onClick={handleSubmit} disabled={submitReport.isPending}>
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          )}
        </div>

        {/* PDF Preview Modal */}
        <Dialog open={showPreview} onOpenChange={closePreview}>
          <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Match Report Preview
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[calc(90vh-100px)] border rounded-lg"
                  title="PDF Preview"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}