import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTournaments } from "@/hooks/useSupabaseData";
import { useCreateTournament, useUpdateTournament, useDeleteTournament } from "@/hooks/useAdminMutations";
import { useTHOAdminUsers, useTournamentAdmins } from "@/hooks/useTHOAdminUsers";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Trophy, UserCog } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];

export default function AdminTournaments() {
  const { data: tournaments, isLoading } = useTournaments();
  const { data: thoAdminUsers } = useTHOAdminUsers();
  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();
  const deleteTournament = useDeleteTournament();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "upcoming",
    logo_url: "",
  });

  // Fetch current assigned admin when editing
  const { data: currentAdmins } = useTournamentAdmins(editingTournament?.id);
  
  useEffect(() => {
    if (currentAdmins?.length) {
      setSelectedAdminId(currentAdmins[0]);
    }
  }, [currentAdmins]);

  const resetForm = () => {
    setFormData({ name: "", description: "", start_date: "", end_date: "", status: "upcoming", logo_url: "" });
    setEditingTournament(null);
    setSelectedAdminId("");
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || "",
      start_date: tournament.start_date || "",
      end_date: tournament.end_date || "",
      status: tournament.status || "upcoming",
      logo_url: tournament.logo_url || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    try {
      if (editingTournament) {
        await updateTournament.mutateAsync({ id: editingTournament.id, ...formData });
        
        // Update tournament admin assignment
        if (selectedAdminId) {
          // Remove existing admins for this tournament
          await supabase
            .from("tournament_admins")
            .delete()
            .eq("tournament_id", editingTournament.id);
          
          // Add new admin
          await supabase
            .from("tournament_admins")
            .insert({ tournament_id: editingTournament.id, user_id: selectedAdminId });
        }
        
        toast({ title: "Success", description: "Tournament updated successfully" });
      } else {
        const result = await createTournament.mutateAsync(formData);
        
        // Assign THO admin to the new tournament
        if (selectedAdminId && result?.id) {
          await supabase
            .from("tournament_admins")
            .insert({ tournament_id: result.id, user_id: selectedAdminId });
        }
        
        toast({ title: "Success", description: "Tournament created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["tournament-admins"] });
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTournament.mutateAsync(id);
      toast({ title: "Success", description: "Tournament deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      upcoming: "outline",
      ongoing: "default",
      completed: "secondary",
    };
    return <Badge variant={variants[status || "upcoming"]}>{status || "upcoming"}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EYLLogo size={40} />
            <div>
              <h1 className="text-2xl font-bold">Tournaments</h1>
              <p className="text-muted-foreground">Manage league tournaments</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTournament ? "Edit Tournament" : "Create Tournament"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tournament name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    Assign THO Admin
                  </Label>
                  <Select value={selectedAdminId || "none"} onValueChange={(val) => setSelectedAdminId(val === "none" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a THO Admin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Admin Assigned</SelectItem>
                      {thoAdminUsers?.map((admin) => (
                        <SelectItem key={admin.user_id} value={admin.user_id}>
                          {admin.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {thoAdminUsers?.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No THO Admin users found. Create one in User Roles first.
                    </p>
                  )}
                </div>
                <ImageUpload
                  label="Tournament Logo"
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  folder="tournaments"
                />
                <Button onClick={handleSubmit} className="w-full" disabled={createTournament.isPending || updateTournament.isPending}>
                  {editingTournament ? "Update" : "Create"} Tournament
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              All Tournaments ({tournaments?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : tournaments?.length === 0 ? (
              <p className="text-muted-foreground">No tournaments found. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments?.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell className="font-medium">{tournament.name}</TableCell>
                      <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                      <TableCell>{tournament.start_date || "-"}</TableCell>
                      <TableCell>{tournament.end_date || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tournament)}>
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
                              <AlertDialogTitle>Delete Tournament?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(tournament.id)}>Delete</AlertDialogAction>
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
