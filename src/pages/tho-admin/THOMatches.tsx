import { useState, useMemo } from "react";
import { THOAdminLayout } from "@/components/admin/THOAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useTeams, useMatches, useTournaments } from "@/hooks/useSupabaseData";
import { useRefereesWithEmail } from "@/hooks/useReferees";
import { useCreateMatch, useUpdateMatch, useDeleteMatch } from "@/hooks/useAdminMutations";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Edit, Trash2, Clock, Search, UserCheck, X } from "lucide-react";

const MATCH_STAGES = [
  { value: "group", label: "Group Stage" },
  { value: "round_of_16", label: "Round of 16" },
  { value: "quarter_final", label: "Quarter Final" },
  { value: "semi_final", label: "Semi Final" },
  { value: "third_place", label: "Third Place" },
  { value: "final", label: "Final" },
] as const;

const KNOCKOUT_STAGES = MATCH_STAGES.filter(s => s.value !== "group");

const EXTRA_TIME_OPTIONS = [
  { value: "extra_time", label: "Extra Time + Penalties" },
  { value: "direct_penalty", label: "Direct Penalty Shootout" },
  { value: "golden_goal", label: "Golden Goal" },
] as const;

export default function THOMatches() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const { data: allTeams = [] } = useTeams();
  const { data: allMatches = [], isLoading } = useMatches();
  const { data: tournaments = [] } = useTournaments();
  const { data: referees = [], isLoading: isLoadingReferees, error: refereeError } = useRefereesWithEmail();
  
  if (refereeError) {
    console.error("Referee fetch error:", refereeError);
  }
  const { assignedTournaments } = useTournamentAdmin();
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [refereeSearch, setRefereeSearch] = useState("");
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [formData, setFormData] = useState({
    home_team_id: "",
    away_team_id: "",
    match_date: "",
    venue: "",
    status: "scheduled",
    referee_id: "",
    stage: "group",
    extra_time_enabled: true,
    extra_time_duration: 30,
    extra_time_option: "extra_time",
  });

  // Filter referees by search query
  const filteredReferees = (referees as any[]).filter((ref) =>
    ref.email?.toLowerCase().includes(refereeSearch.toLowerCase())
  );

  // Filter teams and matches by selected tournament
  const teams = allTeams.filter((t: any) => t.tournament_id === selectedTournamentId);
  const matches = allMatches.filter((m: any) => m.tournament_id === selectedTournamentId);

  const selectedTournament = assignedTournaments.find(
    (t: any) => t.id === selectedTournamentId
  );

  const tournamentDetails = useMemo(() => {
    return tournaments.find((t: any) => t.id === selectedTournamentId) as any;
  }, [tournaments, selectedTournamentId]);

  const isKnockoutFormat = tournamentDetails?.format === "knockout";
  const isGroupKnockoutFormat = tournamentDetails?.format === "group_knockout";
  const isKnockoutStage = formData.stage !== "group";

  // Get available stages based on tournament format
  const availableStages = useMemo(() => {
    if (isKnockoutFormat) {
      return KNOCKOUT_STAGES;
    }
    return MATCH_STAGES;
  }, [isKnockoutFormat]);

  // Group matches by stage for display
  const matchesByStage = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    MATCH_STAGES.forEach(stage => {
      grouped[stage.value] = matches.filter((m: any) => m.stage === stage.value);
    });
    return grouped;
  }, [matches]);

  const resetForm = () => {
    setFormData({
      home_team_id: "",
      away_team_id: "",
      match_date: "",
      venue: "",
      status: "scheduled",
      referee_id: "",
      stage: isKnockoutFormat ? "round_of_16" : "group",
      extra_time_enabled: true,
      extra_time_duration: 30,
      extra_time_option: "extra_time",
    });
    setEditingMatch(null);
    setRefereeSearch("");
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setFormData({
      home_team_id: match.home_team_id || "",
      away_team_id: match.away_team_id || "",
      match_date: match.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : "",
      venue: match.venue || "",
      status: match.status || "scheduled",
      referee_id: match.referee_id || "",
      stage: match.stage || "group",
      extra_time_option: match.extra_time_option || "extra_time",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.home_team_id || !formData.away_team_id) {
      toast({
        title: "Validation Error",
        description: "Home and away teams are required.",
        variant: "destructive",
      });
      return;
    }

    const matchData = {
      home_team_id: formData.home_team_id,
      away_team_id: formData.away_team_id,
      match_date: formData.match_date ? new Date(formData.match_date).toISOString() : null,
      venue: formData.venue,
      status: formData.status,
      referee_id: formData.referee_id || null,
      stage: formData.stage,
      extra_time_option: isKnockoutStage ? formData.extra_time_option : null,
      tournament_id: selectedTournamentId,
    };

    try {
      if (editingMatch) {
        await updateMatch.mutateAsync({ id: editingMatch.id, ...matchData });
        toast({ title: "Match updated successfully" });
      } else {
        await createMatch.mutateAsync(matchData);
        toast({ title: "Match created successfully" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMatch.mutateAsync(id);
      toast({ title: "Match deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find((t: any) => t.id === teamId);
    return team?.name || "TBD";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "live":
        return <Badge variant="destructive">Live</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const getStageBadge = (stage: string) => {
    const stageInfo = MATCH_STAGES.find(s => s.value === stage);
    return <Badge variant="outline">{stageInfo?.label || stage}</Badge>;
  };

  const renderMatchTable = (stageMatches: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Match</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stageMatches.map((match: any) => (
          <TableRow key={match.id}>
            <TableCell className="font-medium">
              {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}
            </TableCell>
            <TableCell>
              {match.match_date ? new Date(match.match_date).toLocaleString() : "TBD"}
            </TableCell>
            <TableCell>{match.venue || "-"}</TableCell>
            <TableCell>{getStatusBadge(match.status)}</TableCell>
            <TableCell>
              {match.status === "completed" || match.status === "live"
                ? `${match.home_score ?? 0} - ${match.away_score ?? 0}`
                : "-"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(match)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(match.id)}
                  disabled={deleteMatch.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <THOAdminLayout
      selectedTournamentId={selectedTournamentId}
      onTournamentChange={setSelectedTournamentId}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Matches Management</h1>
              <div className="text-muted-foreground text-sm">
                {selectedTournament ? `Managing matches for ${(selectedTournament as any).name}` : "Select a tournament"}
                {tournamentDetails && (
                  <span className="ml-2">
                    <Badge variant="secondary">{tournamentDetails.format?.replace("_", " + ").toUpperCase()}</Badge>
                  </span>
                )}
              </div>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!selectedTournamentId || teams.length < 2}>
                <Plus className="h-4 w-4" />
                Add Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
              <DialogHeader className="p-4 pb-0 border-b pb-4">
                <DialogTitle>{editingMatch ? "Edit Match" : "Add New Match"}</DialogTitle>
                <DialogDescription>
                  {editingMatch ? "Update match details" : "Schedule a new match"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-4 max-h-[70vh]">
                <form onSubmit={handleSubmit} id="match-form" className="space-y-4">
                  {/* Match Stage Selection */}
                  <div className="space-y-2">
                    <Label>Match Stage *</Label>
                    <Select value={formData.stage} onValueChange={(val) => setFormData({ ...formData, stage: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStages.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Teams Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Home Team *</Label>
                      <Select value={formData.home_team_id} onValueChange={(val) => setFormData({ ...formData, home_team_id: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select home team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team: any) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} {team.group_name && `(${team.group_name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Away Team *</Label>
                      <Select value={formData.away_team_id} onValueChange={(val) => setFormData({ ...formData, away_team_id: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select away team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.filter((t: any) => t.id !== formData.home_team_id).map((team: any) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} {team.group_name && `(${team.group_name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Match Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.match_date}
                        onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Venue</Label>
                      <Input
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="Stadium name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="postponed">Postponed</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                      Note: Only referees can set matches to "Live" or "Completed" during the match workflow.
                    </p>
                  </div>

                  {/* Tie-breaker Option - only for knockout stages */}
                  {isKnockoutStage && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="flex items-center gap-2 text-primary">
                        <Clock className="h-4 w-4" />
                        Tie-breaker Rule
                      </Label>
                      <Select value={formData.extra_time_option} onValueChange={(val) => setFormData({ ...formData, extra_time_option: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXTRA_TIME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t">
                    <Label className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Assign Referee
                    </Label>

                    {/* Show currently selected referee */}
                    {formData.referee_id ? (() => {
                      const sel = (referees as any[]).find((r) => r.user_id === formData.referee_id);
                      return (
                        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {sel ? sel.email : "Assigned Referee"}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setFormData({ ...formData, referee_id: "" }); setRefereeSearch(""); }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })() : (
                      /* Search box */
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search referee by email..."
                            value={refereeSearch}
                            onChange={(e) => setRefereeSearch(e.target.value)}
                            className="pl-9"
                          />
                          {isLoadingReferees && (
                            <div className="absolute right-3 top-2.5">
                              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        
                        {!isLoadingReferees && referees.length === 0 && (
                          <p className="text-xs text-orange-500 bg-orange-500/5 p-2 rounded border border-orange-500/10 text-center">
                            No active referees found in the system.
                          </p>
                        )}

                        {refereeSearch && (
                          <div className="border rounded-md max-h-40 overflow-y-auto bg-background shadow-lg">
                            {filteredReferees.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-3">No matching referees found</p>
                            ) : (
                              filteredReferees.map((ref: any) => (
                                <button
                                  key={ref.user_id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                  onClick={() => {
                                    setFormData({ ...formData, referee_id: ref.user_id });
                                    setRefereeSearch("");
                                  }}
                                >
                                  <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                  {ref.email}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <DialogFooter className="p-4 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="match-form" disabled={createMatch.isPending || updateMatch.isPending}>
                  {editingMatch ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Matches Display */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Matches</CardTitle>
            <CardDescription>
              {matches.length} matches in this tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : !selectedTournamentId ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select a tournament to manage matches</p>
              </div>
            ) : teams.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Add at least 2 teams before creating matches</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No matches found. Schedule your first match!</p>
              </div>
            ) : isGroupKnockoutFormat ? (
              <Tabs defaultValue="group" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  {MATCH_STAGES.map((stage) => (
                    <TabsTrigger key={stage.value} value={stage.value} className="text-xs">
                      {stage.label.replace("Quarter ", "QF ").replace("Semi ", "SF ")}
                      {matchesByStage[stage.value].length > 0 && (
                        <span className="ml-1 text-muted-foreground">({matchesByStage[stage.value].length})</span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {MATCH_STAGES.map((stage) => (
                  <TabsContent key={stage.value} value={stage.value}>
                    {matchesByStage[stage.value].length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground">No {stage.label.toLowerCase()} matches yet</p>
                      </div>
                    ) : (
                      renderMatchTable(matchesByStage[stage.value])
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match: any) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">
                        {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}
                      </TableCell>
                      <TableCell>{getStageBadge(match.stage)}</TableCell>
                      <TableCell>
                        {match.match_date ? new Date(match.match_date).toLocaleString() : "TBD"}
                      </TableCell>
                      <TableCell>{match.venue || "-"}</TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell>
                        {match.status === "completed" || match.status === "live"
                          ? `${match.home_score ?? 0} - ${match.away_score ?? 0}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(match)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(match.id)}
                            disabled={deleteMatch.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>
    </THOAdminLayout>
  );
}