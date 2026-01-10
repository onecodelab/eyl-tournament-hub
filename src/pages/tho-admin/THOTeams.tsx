import { useState } from "react";
import { THOAdminLayout } from "@/components/admin/THOAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTeams } from "@/hooks/useSupabaseData";
import { useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/hooks/useAdminMutations";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Users, Plus, Edit, Trash2 } from "lucide-react";

export default function THOTeams() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const { data: allTeams = [], isLoading } = useTeams();
  const { assignedTournaments } = useTournamentAdmin();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
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
  });

  // Filter teams by selected tournament
  const teams = allTeams.filter((t: any) => t.tournament_id === selectedTournamentId);

  const selectedTournament = assignedTournaments.find(
    (t: any) => t.id === selectedTournamentId
  );

  const resetForm = () => {
    setFormData({
      name: "",
      short_name: "",
      coach: "",
      stadium: "",
      logo_url: "",
      founded_year: "",
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
              <p className="text-muted-foreground">
                {selectedTournament ? `Managing teams for ${(selectedTournament as any).name}` : "Select a tournament"}
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!selectedTournamentId}>
                <Plus className="h-4 w-4" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
                <DialogDescription>
                  {editingTeam ? "Update team details" : "Add a new team to your tournament"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
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
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTeam.isPending || updateTeam.isPending}>
                    {editingTeam ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              {teams.length} teams in this tournament
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Short</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Stadium</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team: any) => (
                    <TableRow key={team.id}>
                      <TableCell>
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="h-8 w-8 object-contain" />
                        ) : (
                          <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.short_name || "-"}</TableCell>
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
            )}
          </CardContent>
        </Card>
      </div>
    </THOAdminLayout>
  );
}
