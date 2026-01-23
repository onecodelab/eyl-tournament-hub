import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTeams, useTournaments } from "@/hooks/useSupabaseData";
import { useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/hooks/useAdminMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Database } from "@/integrations/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export default function AdminTeams() {
  const { data: teams, isLoading } = useTeams();
  const { data: tournaments } = useTournaments();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    coach: "",
    stadium: "",
    founded_year: "",
    logo_url: "",
    tournament_id: "",
  });

  const resetForm = () => {
    setFormData({ name: "", short_name: "", coach: "", stadium: "", founded_year: "", logo_url: "", tournament_id: "" });
    setEditingTeam(null);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      short_name: team.short_name || "",
      coach: team.coach || "",
      stadium: team.stadium || "",
      founded_year: team.founded_year?.toString() || "",
      logo_url: team.logo_url || "",
      tournament_id: team.tournament_id || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    try {
      const data = {
        name: formData.name,
        short_name: formData.short_name || null,
        coach: formData.coach || null,
        stadium: formData.stadium || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        logo_url: formData.logo_url || null,
        tournament_id: formData.tournament_id || null,
      };
      if (editingTeam) {
        await updateTeam.mutateAsync({ id: editingTeam.id, ...data });
        toast({ title: "Success", description: "Team updated successfully" });
      } else {
        await createTeam.mutateAsync(data);
        toast({ title: "Success", description: "Team created successfully" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam.mutateAsync(id);
      toast({ title: "Success", description: "Team deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EYLLogo size={40} />
            <div>
              <h1 className="text-2xl font-bold">Teams</h1>
              <p className="text-muted-foreground">Manage league teams</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTeam ? "Edit Team" : "Create Team"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-visible">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Team name" />
                </div>
                <div className="space-y-2">
                  <Label>Short Name</Label>
                  <Input value={formData.short_name} onChange={(e) => setFormData({ ...formData, short_name: e.target.value })} placeholder="e.g., FCB" />
                </div>
                <div className="space-y-2">
                  <Label>Coach</Label>
                  <Input value={formData.coach} onChange={(e) => setFormData({ ...formData, coach: e.target.value })} placeholder="Coach name" />
                </div>
                <div className="space-y-2">
                  <Label>Stadium</Label>
                  <Input value={formData.stadium} onChange={(e) => setFormData({ ...formData, stadium: e.target.value })} placeholder="Stadium name" />
                </div>
                <div className="space-y-2">
                  <Label>Founded Year</Label>
                  <Input type="number" value={formData.founded_year} onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })} placeholder="e.g., 2010" />
                </div>
                <div className="space-y-2">
                  <Label>Tournament</Label>
                  <Select value={formData.tournament_id} onValueChange={(value) => setFormData({ ...formData, tournament_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Select tournament" /></SelectTrigger>
                    <SelectContent>
                      {tournaments?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ImageUpload
                  label="Team Logo"
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  folder="teams"
                />
                <Button onClick={handleSubmit} className="w-full" disabled={createTeam.isPending || updateTeam.isPending}>
                  {editingTeam ? "Update" : "Create"} Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Teams ({teams?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : teams?.length === 0 ? (
              <p className="text-muted-foreground">No teams found. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Short</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Stadium</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams?.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.short_name || "-"}</TableCell>
                      <TableCell>{team.coach || "-"}</TableCell>
                      <TableCell>{team.stadium || "-"}</TableCell>
                      <TableCell>{team.points ?? 0}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(team)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Team?</AlertDialogTitle>
                              <AlertDialogDescription>This will remove the team and may affect related players and matches.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(team.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
