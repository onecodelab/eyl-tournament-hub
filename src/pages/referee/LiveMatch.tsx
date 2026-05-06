import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CircleDot,
  Square,
  AlertTriangle,
  ArrowRightLeft,
  Activity,
  Target,
  Clock,
  Trash2,
  Play,
  Pause,
  Flag,
  CheckCircle,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useMatchById,
  useMatchEvents,
  useMatchLineups,
  useTeamPlayers,
  useAddMatchEvent,
  useDeleteMatchEvent,
  useSaveMatchLineup,
  useUpdateMatchStatus,
} from "@/hooks/useRefereeMatches";
import { supabase } from "@/integrations/supabase/client";

const EVENT_TYPES = [
  { value: "goal", label: "Goal", icon: CircleDot, color: "text-green-500" },
  { value: "yellow_card", label: "Yellow Card", icon: Square, color: "text-yellow-500" },
  { value: "red_card", label: "Red Card", icon: Square, color: "text-red-500" },
  { value: "substitution", label: "Substitution", icon: ArrowRightLeft, color: "text-blue-500" },
  { value: "injury", label: "Injury", icon: Activity, color: "text-orange-500" },
  { value: "penalty", label: "Penalty", icon: Target, color: "text-purple-500" },
];

export default function LiveMatch() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: match, isLoading: matchLoading } = useMatchById(matchId || "");
  const { data: events = [], refetch: refetchEvents } = useMatchEvents(matchId || "");
  const { data: lineups = [] } = useMatchLineups(matchId || "");
  const { data: homePlayers = [] } = useTeamPlayers(match?.home_team?.id);
  const { data: awayPlayers = [] } = useTeamPlayers(match?.away_team?.id);

  const addEvent = useAddMatchEvent();
  const deleteEvent = useDeleteMatchEvent();
  const saveLineup = useSaveMatchLineup();
  const updateStatus = useUpdateMatchStatus();

  // Lineup state
  const [homeGoalkeeper, setHomeGoalkeeper] = useState<string>("");
  const [homeSelectedPlayers, setHomeSelectedPlayers] = useState<string[]>([]);
  const [awayGoalkeeper, setAwayGoalkeeper] = useState<string>("");
  const [awaySelectedPlayers, setAwaySelectedPlayers] = useState<string[]>([]);

  // Event state
  const [eventType, setEventType] = useState("goal");
  const [eventTeam, setEventTeam] = useState<"home" | "away">("home");
  const [eventPlayer, setEventPlayer] = useState("");
  const [eventMinute, setEventMinute] = useState(1);
  const [subOutPlayer, setSubOutPlayer] = useState("");
  const [subInPlayer, setSubInPlayer] = useState("");
  const [cardReason, setCardReason] = useState("");

  // Referee info state
  const [refereeName, setRefereeName] = useState("");
  const [assistantRef1, setAssistantRef1] = useState("");
  const [assistantRef2, setAssistantRef2] = useState("");

  // Timer state
  const [matchTime, setMatchTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Knockout tie-breaker state
  const [matchPhase, setMatchPhase] = useState<"regular" | "extra_time" | "penalties">("regular");
  const [penaltyHome, setPenaltyHome] = useState(0);
  const [penaltyAway, setPenaltyAway] = useState(0);

  // Load existing lineups
  useEffect(() => {
    if (lineups.length > 0 && match) {
      const homeLineup = lineups.find((l) => l.team_id === match.home_team?.id);
      const awayLineup = lineups.find((l) => l.team_id === match.away_team?.id);

      if (homeLineup) {
        setHomeGoalkeeper(homeLineup.goalkeeper_id || "");
        setHomeSelectedPlayers(homeLineup.player_ids || []);
      }
      if (awayLineup) {
        setAwayGoalkeeper(awayLineup.goalkeeper_id || "");
        setAwaySelectedPlayers(awayLineup.player_ids || []);
      }
    }
  }, [lineups, match]);

  // Realtime subscription for events
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match-events-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          refetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, refetchEvents]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setMatchTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate scores from events
  const scores = useMemo(() => {
    let home = match?.home_score ?? 0;
    let away = match?.away_score ?? 0;
    
    // If match has stored scores, use them; otherwise calculate from events
    if (match?.status === "live" || !match?.home_score) {
      home = events.filter(
        (e) => e.event_type === "goal" && e.team_id === match?.home_team?.id
      ).length;
      away = events.filter(
        (e) => e.event_type === "goal" && e.team_id === match?.away_team?.id
      ).length;
    }
    
    return { home, away };
  }, [events, match]);

  const isSetupPhase = match?.status === "scheduled";
  const isLive = match?.status === "live";
  const isCompleted = match?.status === "completed";

  // Determine if this is a knockout match (not group stage)
  const isKnockoutMatch = useMemo(() => {
    if (!match) return false;
    const stage = match.stage || "group";
    return stage !== "group";
  }, [match]);

  const isScoreTied = scores.home === scores.away;

  const handleSaveLineups = async () => {
    if (!matchId || !match) return;

    try {
      await Promise.all([
        saveLineup.mutateAsync({
          match_id: matchId,
          team_id: match.home_team?.id || "",
          goalkeeper_id: homeGoalkeeper || null,
          player_ids: homeSelectedPlayers,
        }),
        saveLineup.mutateAsync({
          match_id: matchId,
          team_id: match.away_team?.id || "",
          goalkeeper_id: awayGoalkeeper || null,
          player_ids: awaySelectedPlayers,
        }),
      ]);

      toast.success("Lineups saved successfully!");
    } catch (error) {
      toast.error("Failed to save lineups");
    }
  };

  const handleStartMatch = async () => {
    if (!matchId) return;

    try {
      await updateStatus.mutateAsync({ matchId, status: "live" });
      setIsTimerRunning(true);
      toast.success("Match started!");
    } catch (error) {
      toast.error("Failed to start match");
    }
  };

  const handleAddEvent = async () => {
    if (!matchId || !match) return;

    const teamId = eventTeam === "home" ? match.home_team?.id : match.away_team?.id;
    const details: Record<string, unknown> = {};

    if (eventType === "substitution") {
      if (subOutPlayer) details.player_out = subOutPlayer;
      if (subInPlayer) details.player_in = subInPlayer;
    }

    if ((eventType === "yellow_card" || eventType === "red_card") && cardReason) {
      details.reason = cardReason;
    }

    try {
      await addEvent.mutateAsync({
        match_id: matchId,
        event_type: eventType,
        team_id: teamId,
        player_id: eventType === "substitution" ? subOutPlayer || undefined : eventPlayer || undefined,
        minute: eventMinute,
        details,
      });

      // Update score if goal
      if (eventType === "goal") {
        const newHome = eventTeam === "home" ? scores.home + 1 : scores.home;
        const newAway = eventTeam === "away" ? scores.away + 1 : scores.away;
        await updateStatus.mutateAsync({
          matchId,
          status: "live",
          homeScore: newHome,
          awayScore: newAway,
        });
      }

      toast.success("Event added!");
      setEventPlayer("");
      setSubOutPlayer("");
      setSubInPlayer("");
      setCardReason("");
    } catch (error) {
      toast.error("Failed to add event");
    }
  };

  const handleQuickEvent = (type: string) => {
    setEventType(type);
    setEventMinute(Math.floor(matchTime / 60) + 1);
  };

  const handleGoToExtraTime = () => {
    setMatchPhase("extra_time");
    setMatchTime(0);
    setIsTimerRunning(true);
    toast.success("Extra time started!");
  };

  const handleGoToPenalties = () => {
    setMatchPhase("penalties");
    setIsTimerRunning(false);
    setMatchTime(0);
    setPenaltyHome(0);
    setPenaltyAway(0);
    toast.success("Penalty shootout started!");
  };

  const handleEndMatch = async () => {
    if (!matchId) return;

    try {
      setIsTimerRunning(false);

      // If penalties were taken, add the penalty_result event FIRST (before status change triggers)
      if (matchPhase === "penalties") {
        await addEvent.mutateAsync({
          match_id: matchId,
          event_type: "penalty_shootout",
          team_id: penaltyHome > penaltyAway ? match?.home_team?.id : match?.away_team?.id,
          minute: 120,
          details: {
            home_penalties: penaltyHome,
            away_penalties: penaltyAway,
            winner: penaltyHome > penaltyAway ? "home" : "away",
          },
        });
      }

      // Now update match status to completed
      await updateStatus.mutateAsync({
        matchId,
        status: "completed",
        homeScore: scores.home,
        awayScore: scores.away,
      });

      toast.success("Match ended!");
      navigate(`/referee/match/${matchId}/report`);
    } catch (error: any) {
      // MobSF Fix: CWE-532 — Removed error logging
      toast.error("Failed to end match: " + (error?.message || "Unknown error"));
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!matchId) return;

    try {
      await deleteEvent.mutateAsync({ eventId, matchId });
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const selectedTeamPlayers = eventTeam === "home" ? homePlayers : awayPlayers;

  const getEventIcon = (type: string) => {
    const eventConfig = EVENT_TYPES.find((e) => e.value === type);
    if (!eventConfig) return null;
    const Icon = eventConfig.icon;
    return <Icon className={`h-4 w-4 ${eventConfig.color}`} />;
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Scoreboard */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-background to-primary/10">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {match.home_team?.logo_url ? (
                  <img src={match.home_team.logo_url} alt="" className="h-14 w-14 object-contain scale-125 drop-shadow-md" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {match.home_team?.short_name || "HT"}
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg">{match.home_team?.name || "Home"}</p>
                  <p className="text-xs text-muted-foreground">Home</p>
                </div>
              </div>

              <div className="text-center px-8">
                <div className="text-4xl font-bold mb-1">
                  {scores.home} - {scores.away}
                </div>
                {matchPhase === "penalties" && (
                  <div className="text-sm font-semibold text-muted-foreground mb-1">
                    Pen: {penaltyHome} - {penaltyAway}
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-lg">{formatTime(matchTime)}</span>
                  {isLive && (
                    <Badge className="bg-destructive animate-pulse text-xs text-destructive-foreground">
                      {matchPhase === "regular" ? "LIVE" : matchPhase === "extra_time" ? "ET" : "PEN"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="text-right">
                  <p className="font-bold text-lg">{match.away_team?.name || "Away"}</p>
                  <p className="text-xs text-muted-foreground">Away</p>
                </div>
                {match.away_team?.logo_url ? (
                  <img src={match.away_team.logo_url} alt="" className="h-14 w-14 object-contain scale-125 drop-shadow-md" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {match.away_team?.short_name || "AT"}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Phase: Referee Info + Lineup Selection */}
        {isSetupPhase && (
          <>
            {/* Referee Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Match Officials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Centre Referee *</Label>
                    <Input
                      placeholder="Enter referee name"
                      value={refereeName}
                      onChange={(e) => setRefereeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Assistant Referee 1</Label>
                    <Input
                      placeholder="Enter assistant referee 1 name"
                      value={assistantRef1}
                      onChange={(e) => setAssistantRef1(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Assistant Referee 2</Label>
                    <Input
                      placeholder="Enter assistant referee 2 name"
                      value={assistantRef2}
                      onChange={(e) => setAssistantRef2(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lineup Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pre-Match Setup - Select Lineups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Home Team Lineup */}
                  <div>
                    <h3 className="font-semibold mb-3">{match.home_team?.name} Lineup</h3>
                    
                    <div className="mb-4">
                      <Label>Goalkeeper (Required)</Label>
                      <Select value={homeGoalkeeper} onValueChange={setHomeGoalkeeper}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goalkeeper" />
                        </SelectTrigger>
                        <SelectContent>
                          {homePlayers
                            .filter((p) => p.position?.toLowerCase() === "goalkeeper")
                            .map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                #{player.jersey_number} {player.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Outfield Players (4-10)</Label>
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {homePlayers
                          .filter((p) => p.position?.toLowerCase() !== "goalkeeper")
                          .map((player) => (
                            <div key={player.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`home-${player.id}`}
                                checked={homeSelectedPlayers.includes(player.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setHomeSelectedPlayers([...homeSelectedPlayers, player.id]);
                                  } else {
                                    setHomeSelectedPlayers(
                                      homeSelectedPlayers.filter((id) => id !== player.id)
                                    );
                                  }
                                }}
                              />
                              <label htmlFor={`home-${player.id}`} className="text-sm">
                                #{player.jersey_number} {player.name} ({player.position})
                              </label>
                            </div>
                          ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {homeSelectedPlayers.length} players
                      </p>
                    </div>
                  </div>

                  {/* Away Team Lineup */}
                  <div>
                    <h3 className="font-semibold mb-3">{match.away_team?.name} Lineup</h3>
                    
                    <div className="mb-4">
                      <Label>Goalkeeper (Required)</Label>
                      <Select value={awayGoalkeeper} onValueChange={setAwayGoalkeeper}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goalkeeper" />
                        </SelectTrigger>
                        <SelectContent>
                          {awayPlayers
                            .filter((p) => p.position?.toLowerCase() === "goalkeeper")
                            .map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                #{player.jersey_number} {player.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Outfield Players (4-10)</Label>
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {awayPlayers
                          .filter((p) => p.position?.toLowerCase() !== "goalkeeper")
                          .map((player) => (
                            <div key={player.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`away-${player.id}`}
                                checked={awaySelectedPlayers.includes(player.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setAwaySelectedPlayers([...awaySelectedPlayers, player.id]);
                                  } else {
                                    setAwaySelectedPlayers(
                                      awaySelectedPlayers.filter((id) => id !== player.id)
                                    );
                                  }
                                }}
                              />
                              <label htmlFor={`away-${player.id}`} className="text-sm">
                                #{player.jersey_number} {player.name} ({player.position})
                              </label>
                            </div>
                          ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {awaySelectedPlayers.length} players
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSaveLineups} disabled={saveLineup.isPending}>
                    Save Lineups
                  </Button>
                  <Button 
                    onClick={handleStartMatch} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!homeGoalkeeper || !awayGoalkeeper || homeSelectedPlayers.length < 4 || awaySelectedPlayers.length < 4 || !refereeName}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Match
                  </Button>
                </div>
                {!refereeName && (
                  <p className="text-xs text-destructive mt-2">* Centre Referee name is required to start the match</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Live Phase: Event Logging */}
        {(isLive || isCompleted) && (
          <>
            {/* Event Input */}
            {isLive && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Log Event</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isTimerRunning ? "destructive" : "default"}
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                      >
                        {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Event Type</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className={`h-4 w-4 ${type.color}`} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Team</Label>
                      <Select
                        value={eventTeam}
                        onValueChange={(v) => {
                          setEventTeam(v as "home" | "away");
                          setEventPlayer("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">{match.home_team?.short_name || "Home"}</SelectItem>
                          <SelectItem value="away">{match.away_team?.short_name || "Away"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Player</Label>
                      <Select value={eventPlayer} onValueChange={setEventPlayer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTeamPlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              #{player.jersey_number} {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Minute</Label>
                      <Input
                        type="number"
                        min={1}
                        max={120}
                        value={eventMinute}
                        onChange={(e) => setEventMinute(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {eventType === "substitution" && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Player Out (Leaving)</Label>
                        <Select value={subOutPlayer} onValueChange={setSubOutPlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select player leaving" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTeamPlayers.map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                #{player.jersey_number} {player.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Player In (Entering)</Label>
                        <Select value={subInPlayer} onValueChange={setSubInPlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select player entering" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTeamPlayers
                              .filter((p) => p.id !== subOutPlayer)
                              .map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  #{player.jersey_number} {player.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {(eventType === "yellow_card" || eventType === "red_card") && (
                    <div className="mb-4">
                      <Label>Reason for Card</Label>
                      <Select value={cardReason} onValueChange={setCardReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unsporting behaviour">Unsporting behaviour</SelectItem>
                          <SelectItem value="Dissent">Dissent</SelectItem>
                          <SelectItem value="Persistent infringement">Persistent infringement</SelectItem>
                          <SelectItem value="Delaying restart">Delaying restart</SelectItem>
                          <SelectItem value="Failure to respect distance">Failure to respect distance</SelectItem>
                          <SelectItem value="Entering/leaving without permission">Entering/leaving without permission</SelectItem>
                          <SelectItem value="Serious foul play">Serious foul play</SelectItem>
                          <SelectItem value="Violent conduct">Violent conduct</SelectItem>
                          <SelectItem value="Spitting">Spitting</SelectItem>
                          <SelectItem value="Denying goal (handball)">Denying goal (handball)</SelectItem>
                          <SelectItem value="Denying goal (foul)">Denying goal (foul)</SelectItem>
                          <SelectItem value="Offensive language">Offensive language</SelectItem>
                          <SelectItem value="Second yellow card">Second yellow card</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={handleAddEvent} disabled={addEvent.isPending}>
                    Add Event
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Match Phase Indicator */}
            {isLive && matchPhase !== "regular" && (
              <Card className="mb-6 border-primary/50 bg-primary/5">
                <CardContent className="py-3 text-center">
                  <Badge className="text-sm px-4 py-1" variant={matchPhase === "penalties" ? "destructive" : "default"}>
                    {matchPhase === "extra_time" ? "⏱️ EXTRA TIME" : "🎯 PENALTY SHOOTOUT"}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Penalty Shootout Panel */}
            {isLive && matchPhase === "penalties" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-center">Penalty Shootout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center space-y-3">
                      <p className="font-semibold text-sm">{match.home_team?.short_name || "Home"}</p>
                      <div className="text-4xl font-bold">{penaltyHome}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-500 border-green-500/30" onClick={() => setPenaltyHome(p => p + 1)}>
                          ✓ Scored
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => setPenaltyHome(p => Math.max(0, p - 1))}>
                          ✗ Undo
                        </Button>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground">vs</div>
                    <div className="text-center space-y-3">
                      <p className="font-semibold text-sm">{match.away_team?.short_name || "Away"}</p>
                      <div className="text-4xl font-bold">{penaltyAway}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-500 border-green-500/30" onClick={() => setPenaltyAway(p => p + 1)}>
                          ✓ Scored
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => setPenaltyAway(p => Math.max(0, p - 1))}>
                          ✗ Undo
                        </Button>
                      </div>
                    </div>
                  </div>
                  {penaltyHome !== penaltyAway && (
                    <div className="text-center mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            End Match (Penalties: {penaltyHome} - {penaltyAway})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>End Match?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Final score: {scores.home} - {scores.away} (Penalties: {penaltyHome} - {penaltyAway}). Winner: {penaltyHome > penaltyAway ? match.home_team?.name : match.away_team?.name}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleEndMatch}>End Match</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            {isLive && (
              <Card className="mb-6">
                <CardContent className="py-4">
                  <div className="flex flex-wrap gap-2">
                    {EVENT_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickEvent(type.value)}
                      >
                        <type.icon className={`h-4 w-4 mr-1 ${type.color}`} />
                        {type.label}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => handleQuickEvent("halftime")}>
                      <Flag className="h-4 w-4 mr-1" />
                      Halftime
                    </Button>

                    {/* Knockout tie-breaker flow */}
                    {isKnockoutMatch && isScoreTied && matchPhase === "regular" && match?.extra_time_option !== "direct_penalty" ? (
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white" size="sm" onClick={handleGoToExtraTime}>
                        <Clock className="h-4 w-4 mr-1" />
                        Go to Extra Time
                      </Button>
                    ) : isKnockoutMatch && isScoreTied && matchPhase === "regular" && match?.extra_time_option === "direct_penalty" ? (
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white" size="sm" onClick={handleGoToPenalties}>
                        <Target className="h-4 w-4 mr-1" />
                        Go to Penalty Shootout
                      </Button>
                    ) : isKnockoutMatch && isScoreTied && matchPhase === "extra_time" ? (
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white" size="sm" onClick={handleGoToPenalties}>
                        <Target className="h-4 w-4 mr-1" />
                        Go to Penalty Shootout
                      </Button>
                    ) : matchPhase !== "penalties" ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            End Match
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>End Match?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will finalize the score as {scores.home} - {scores.away} and proceed to the match report.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleEndMatch}>End Match</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Events Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Match Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No events recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((event: any) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="font-mono text-sm font-bold w-12">
                          {event.minute}'
                        </span>
                        {getEventIcon(event.event_type)}
                        <div className="flex-1">
                          <span className="font-medium capitalize">
                            {event.event_type.replace("_", " ")}
                          </span>
                          {event.player && (
                            <span className="text-muted-foreground">
                              {" "}
                              - #{event.player.jersey_number} {event.player.name}
                            </span>
                          )}
                          {event.team && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({event.team.short_name || event.team.name})
                            </span>
                          )}
                        </div>
                        {isLive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {isCompleted && (
              <div className="mt-6 text-center">
                <Button onClick={() => navigate(`/referee/match/${matchId}/report`)}>
                  View/Edit Match Report
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
