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
import { toast } from "sonner";
import {
  useMatchById,
  useMatchEvents,
  useMatchReport,
  useSubmitMatchReport,
} from "@/hooks/useRefereeMatches";

const WEATHER_OPTIONS = [
  { value: "sunny", label: "Sunny", icon: Sun },
  { value: "cloudy", label: "Cloudy", icon: Cloud },
  { value: "rainy", label: "Rainy", icon: CloudRain },
  { value: "windy", label: "Windy", icon: Wind },
];

export default function MatchReport() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: match, isLoading: matchLoading } = useMatchById(matchId || "");
  const { data: events = [] } = useMatchEvents(matchId || "");
  const { data: existingReport } = useMatchReport(matchId || "");
  const submitReport = useSubmitMatchReport();

  const [attendance, setAttendance] = useState<string>("");
  const [weather, setWeather] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load existing report data
  useEffect(() => {
    if (existingReport) {
      setAttendance(existingReport.attendance?.toString() || "");
      setWeather(existingReport.weather || "");
      setNotes(existingReport.notes || "");
      setIsSubmitted(true);
    }
  }, [existingReport]);

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
      toast.success("Match report submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit report");
    }
  };

  const handleDownloadPDF = () => {
    // Create a simple text-based report for now
    const reportContent = `
MATCH REPORT
============

${match?.home_team?.name || "Home"} ${match?.home_score ?? 0} - ${match?.away_score ?? 0} ${match?.away_team?.name || "Away"}

Date: ${match?.match_date ? format(new Date(match.match_date), "MMMM d, yyyy") : "N/A"}
Venue: ${match?.venue || "N/A"}
Attendance: ${attendance || "N/A"}
Weather: ${weather || "N/A"}

GOALS
-----
${eventSummary.goals.map((g: any) => `${g.minute}' - ${g.player?.name || "Unknown"} (${g.team?.name || "Unknown"})`).join("\n") || "No goals"}

YELLOW CARDS
------------
${eventSummary.yellowCards.map((c: any) => `${c.minute}' - ${c.player?.name || "Unknown"} (${c.team?.name || "Unknown"})`).join("\n") || "No yellow cards"}

RED CARDS
---------
${eventSummary.redCards.map((c: any) => `${c.minute}' - ${c.player?.name || "Unknown"} (${c.team?.name || "Unknown"})`).join("\n") || "No red cards"}

SUBSTITUTIONS
-------------
${eventSummary.substitutions.map((s: any) => `${s.minute}' - ${s.player?.name || "Unknown"} (${s.team?.name || "Unknown"})`).join("\n") || "No substitutions"}

REFEREE NOTES
-------------
${notes || "No additional notes"}
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `match-report-${matchId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/referee/match/${matchId}`)}>
            ← Back to Match
          </Button>
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
              <div className="text-5xl font-bold">
                {match.home_score ?? 0} - {match.away_score ?? 0}
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

        {/* Report Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Match Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Attendance</Label>
                <Input
                  type="number"
                  placeholder="Number of spectators"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  disabled={isSubmitted}
                />
              </div>
              <div>
                <Label>Weather</Label>
                <Select value={weather} onValueChange={setWeather} disabled={isSubmitted}>
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
            </div>

            {/* Goals Summary */}
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
                    <div key={goal.id} className="text-sm flex items-center gap-2">
                      <span className="font-mono w-8">{goal.minute}'</span>
                      <span>
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
                    <div key={card.id} className="text-sm flex items-center gap-2">
                      <span className="font-mono w-8">{card.minute}'</span>
                      <span>
                        {card.player?.name || "Unknown"} ({card.team?.short_name || card.team?.name})
                      </span>
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
                    <div key={card.id} className="text-sm flex items-center gap-2">
                      <span className="font-mono w-8">{card.minute}'</span>
                      <span>
                        {card.player?.name || "Unknown"} ({card.team?.short_name || card.team?.name})
                      </span>
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
                  {eventSummary.substitutions.map((sub: any) => (
                    <div key={sub.id} className="text-sm flex items-center gap-2">
                      <span className="font-mono w-8">{sub.minute}'</span>
                      <span>
                        {sub.player?.name || "Unknown"} ({sub.team?.short_name || sub.team?.name})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referee Notes */}
            <div>
              <Label>Referee Notes</Label>
              <Textarea
                placeholder="Add any additional comments about the match..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitted}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate("/referee")}>
            Cancel
          </Button>
          {isSubmitted ? (
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitReport.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save & Submit Report
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
