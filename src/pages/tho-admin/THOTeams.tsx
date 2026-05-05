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
import { useTeams, useTournaments } from "@/hooks/useSupabaseData";
import { useCreateTeam, useUpdateTeam, useDeleteTeam, useBulkCreateTeams } from "@/hooks/useAdminMutations";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CSVImportDialog } from "@/components/admin/CSVImportDialog";
import { parseCSV, generateTeamsCSVTemplate } from "@/utils/csvParser";
import { Users, Plus, Edit, Trash2 } from "lucide-react";

// Generate group names A-H
const GROUP_NAMES = ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H"];

export default function THOTeams() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const { data: allTeams = [], isLoading } = useTeams();
  const { data: tournaments = [] } = useTournaments();
  const { assignedTournaments } = useTournamentAdmin();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const bulkCreateTeams = useBulkCreateTeams();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    coach: "",
    stadium: "",
    logo_url: "",
    founded_year: "",
    group_name: "",
  });

  // Filter teams by selected tournament
  const teams = allTeams.filter((t: any) => t.tournament_id === selectedTournamentId);

  const selectedTournament = assignedTournaments.find(
    (t: any) => t.id === selectedTournamentId
  );

  const tournamentDetails = useMemo(() => {
    return tournaments.find((t: any) => t.id === selectedTournamentId) as any;
  }, [tournaments, selectedTournamentId]);

  const isGroupKnockoutFormat = tournamentDetails?.format === "group_knockout";
  const numGroups = tournamentDetails?.num_groups || 2;

  // Get available groups based on tournament configuration
  const availableGroups = useMemo(() => {
    return GROUP_NAMES.slice(0, numGroups);
  }, [numGroups]);

  // Group teams by group_name for display
  const teamsByGroup = useMemo(() => {
    const grouped: Record<string, any[]> = { "Unassigned": [] };
    availableGroups.forEach(group => {
      grouped[group] = [];
    });
    teams.forEach((team: any) => {
      if (team.group_name && grouped[team.group_name]) {
        grouped[team.group_name].push(team);
      } else {
        grouped["Unassigned"].push(team);
      }
    });
    return grouped;
  }, [teams, availableGroups]);

  const resetForm = () => {
    setFormData({
      name: "",
      short_name: "",
      coach: "",
      stadium: "",
      logo_url: "",
      founded_year: "",
      group_name: "",
    });
    setEditingTeam(null);
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || "",
      short_name: team.short_name || "",
      coach: team.coach || "",
      stadium: team.stadium || "",
      logo_url: team.logo_url || "",
      founded_year: team.founded_year?.toString() || "",
      group_name: team.group_name || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !selectedTournamentId) {
      toast({
        title: "Validation Error",
        description: "Team name is required.",
        variant: "destructive",
      });
      return;
    }

    const teamData = {
      ...formData,
      tournament_id: selectedTournamentId,
      founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
      group_name: formData.group_name || null,
    };

    try {
      if (editingTeam) {
        await updateTeam.mutateAsync({ id: editingTeam.id, ...teamData });
        toast({ title: "Team updated successfully" });
      } else {
        await createTeam.mutateAsync(teamData);
        toast({ title: "Team created successfully" });
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
      await deleteTeam.mutateAsync(id);
      toast({ title: "Team deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderTeamTable = (teamList: any[], showGroup = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Logo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Short</TableHead>
          {showGroup && <TableHead>Group</TableHead>}
          <TableHead>Coach</TableHead>
          <TableHead>Stadium</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamList.map((team: any) => (
          <TableRow key={team.id}>
            <TableCell>
              {team.logo_url ? (
                <div className="flex items-center justify-center h-8 w-8">
                  <img src={team.logo_url} alt={team.name} className="h-8 w-8 object-contain scale-125 drop-shadow-sm" />
                </div>
              ) : (
                <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium">{team.name}</TableCell>
            <TableCell>{team.short_name || "-"}</TableCell>
            {showGroup && (
              <TableCell>
                {team.group_name ? (
                  <Badge variant="outline">{team.group_name}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            )}
            <TableCell>{team.coach || "-"}</TableCell>
            <TableCell>{team.stadium || "-"}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(team)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(team.id)}
                  disabled={deleteTeam.isPending}
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Teams Management</h1>
              <div className="text-muted-foreground text-sm">
                {selectedTournament ? `Managing teams for ${(selectedTournament as any).name}` : "Select a tournament"}
                {tournamentDetails && (
                  <span className="ml-2">
                    <Badge variant="secondary">{tournamentDetails.format?.replace("_", " + ").toUpperCase()}</Badge>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CSVImportDialog
              title="Import Teams from CSV"
              description="Upload a CSV file to bulk import teams into this tournament."
              templateGenerator={generateTeamsCSVTemplate}
              templateFilename="teams_template.csv"
              disabled={!selectedTournamentId}
              onImport={async (file) => {
                const text = await file.text();
                const result = parseCSV<{
                  name: string;
                  short_name: string;
                  coach: string;
                  stadium: string;
                  founded_year: string;
                  group_name: string;
                }>(
                  text,
                  {
                    name: "name",
                    short_name: "short_name",
                    coach: "coach",
                    stadium: "stadium",
                    founded_year: "founded_year",
                    group_name: "group_name",
                  },
                  ["name"]
                );

                if (result.data.length === 0) {
                  return { success: 0, errors: result.errors.length > 0 ? result.errors : ["No valid teams found in CSV"] };
                }

                const teamsToInsert = result.data.map((row) => ({
                  name: row.name,
                  short_name: row.short_name || null,
                  coach: row.coach || null,
                  stadium: row.stadium || null,
                  founded_year: row.founded_year ? parseInt(row.founded_year) : null,
                  group_name: row.group_name || null,
                  tournament_id: selectedTournamentId!,
                }));

                try {
                  await bulkCreateTeams.mutateAsync(teamsToInsert);
                  toast({ title: `Successfully imported ${teamsToInsert.length} teams` });
                  return { success: teamsToInsert.length, errors: result.errors };
                } catch (error: any) {
                  return { success: 0, errors: [error.message || "Failed to import teams"] };
                }
              }}
            />
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={!selectedTournamentId}>
                  <Plus className="h-4 w-4" />
                  Add Team
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
                <DialogDescription>
                  {editingTeam ? "Update team details" : "Add a new team to your tournament"}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '60vh', scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))' }}>
                <form onSubmit={handleSubmit} id="team-form">
                  <div className="space-y-4 py-4 pr-2">
                  <div className="space-y-2">
                    <Label>Team Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Short Name</Label>
                    <Input
                      value={formData.short_name}
                      onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                      placeholder="e.g. FCB"
                    />
                  </div>

                  {/* Group Assignment - only for Group+Knockout format */}
                  {isGroupKnockoutFormat && (
                    <div className="space-y-2">
                      <Label>Group Assignment</Label>
                      <Select 
                        value={formData.group_name || "none"} 
                        onValueChange={(val) => setFormData({ ...formData, group_name: val === "none" ? "" : val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Group (Unassigned)</SelectItem>
                          {availableGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Coach</Label>
                    <Input
                      value={formData.coach}
                      onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                      placeholder="Coach name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stadium</Label>
                    <Input
                      value={formData.stadium}
                      onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                      placeholder="Stadium name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Founded Year</Label>
                    <Input
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                      placeholder="e.g. 1990"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <ImageUpload
                      label="Team Logo"
                      value={formData.logo_url}
                      onChange={(url) => setFormData({ ...formData, logo_url: url })}
                      bucket="hero-images"
                    />
                  </div>
                  </div>
                </form>
              </div>
              <DialogFooter className="flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="team-form" disabled={createTeam.isPending || updateTeam.isPending}>
                  {editingTeam ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Teams Display */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              {teams.length} teams in this tournament
              {isGroupKnockoutFormat && tournamentDetails && (
                <span className="ml-2">
                  ({numGroups} groups, {tournamentDetails.teams_per_group} teams per group)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : !selectedTournamentId ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select a tournament to manage teams</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No teams found. Add your first team!</p>
              </div>
            ) : isGroupKnockoutFormat ? (
              <div className="space-y-6">
                {/* Unassigned Teams */}
                {teamsByGroup["Unassigned"].length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-orange-500">Unassigned Teams ({teamsByGroup["Unassigned"].length})</h3>
                    {renderTeamTable(teamsByGroup["Unassigned"])}
                  </div>
                )}

                {/* Groups */}
                {availableGroups.map((group) => (
                  <div key={group} className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Badge variant="outline">{group}</Badge>
                      <span className="text-muted-foreground">
                        ({teamsByGroup[group]?.length || 0}/{tournamentDetails?.teams_per_group || 4} teams)
                      </span>
                    </h3>
                    {teamsByGroup[group]?.length > 0 ? (
                      renderTeamTable(teamsByGroup[group])
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded">
                        No teams assigned to this group yet
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              renderTeamTable(teams, false)
            )}
          </CardContent>
        </Card>
      </div>
    </THOAdminLayout>
  );
}