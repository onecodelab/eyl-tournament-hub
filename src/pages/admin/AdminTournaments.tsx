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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Trophy, UserCog, Settings, Clock, Users } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];

const AGE_CATEGORIES = ["u-13", "u-14", "u-15", "u-16", "u-17", "u-18", "u-19", "u-20"] as const;
const TOURNAMENT_FORMATS = [
  { value: "league", label: "League", description: "Round-robin where all teams play each other" },
  { value: "knockout", label: "Knockout", description: "Single elimination bracket" },
  { value: "group_knockout", label: "Group + Knockout", description: "Group stage followed by knockout rounds" },
] as const;

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
    // New fields
    age_category: "",
    format: "league",
    max_teams: 16,
    match_duration_minutes: 90,
    half_time_duration_minutes: 15,
    max_substitutions: 5,
    extra_time_duration_minutes: 30,
    penalty_shootout: true,
  });

  // Fetch current assigned admin when editing
  const { data: currentAdmins } = useTournamentAdmins(editingTournament?.id);
  
  useEffect(() => {
    if (currentAdmins?.length) {
      setSelectedAdminId(currentAdmins[0]);
    }
  }, [currentAdmins]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "upcoming",
      logo_url: "",
      age_category: "",
      format: "league",
      max_teams: 16,
      match_duration_minutes: 90,
      half_time_duration_minutes: 15,
      max_substitutions: 5,
      extra_time_duration_minutes: 30,
      penalty_shootout: true,
    });
    setEditingTournament(null);
    setSelectedAdminId("");
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    const tournamentData = tournament as any;
    setFormData({
      name: tournament.name,
      description: tournament.description || "",
      start_date: tournament.start_date || "",
      end_date: tournament.end_date || "",
      status: tournament.status || "upcoming",
      logo_url: tournament.logo_url || "",
      age_category: tournamentData.age_category || "",
      format: tournamentData.format || "league",
      max_teams: tournamentData.max_teams || 16,
      match_duration_minutes: tournamentData.match_duration_minutes || 90,
      half_time_duration_minutes: tournamentData.half_time_duration_minutes || 15,
      max_substitutions: tournamentData.max_substitutions || 5,
      extra_time_duration_minutes: tournamentData.extra_time_duration_minutes || 30,
      penalty_shootout: tournamentData.penalty_shootout ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    
    // Prepare data with new fields
    const tournamentData = {
      name: formData.name,
      description: formData.description || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status,
      logo_url: formData.logo_url || null,
      age_category: formData.age_category || null,
      format: formData.format,
      max_teams: formData.max_teams,
      match_duration_minutes: formData.match_duration_minutes,
      half_time_duration_minutes: formData.half_time_duration_minutes,
      max_substitutions: formData.max_substitutions,
      extra_time_duration_minutes: formData.format !== "league" ? formData.extra_time_duration_minutes : null,
      penalty_shootout: formData.format !== "league" ? formData.penalty_shootout : null,
    };

    try {
      if (editingTournament) {
        await updateTournament.mutateAsync({ id: editingTournament.id, ...tournamentData } as any);
        
        // Update tournament admin assignment
        if (selectedAdminId) {
          await supabase
            .from("tournament_admins")
            .delete()
            .eq("tournament_id", editingTournament.id);
          
          await supabase
            .from("tournament_admins")
            .insert({ tournament_id: editingTournament.id, user_id: selectedAdminId });
        }
        
        toast({ title: "Success", description: "Tournament updated successfully" });
      } else {
        const result = await createTournament.mutateAsync(tournamentData as any);
        
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

  const getFormatBadge = (format: string | null) => {
    const labels: Record<string, string> = {
      league: "League",
      knockout: "Knockout",
      group_knockout: "Group + KO",
    };
    return <Badge variant="outline">{labels[format || "league"] || format}</Badge>;
  };

  const showKnockoutOptions = formData.format === "knockout" || formData.format === "group_knockout";

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTournament ? "Edit Tournament" : "Create Tournament"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
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
                </div>

                <Separator />

                {/* Tournament Configuration Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Tournament Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age Category</Label>
                      <Select value={formData.age_category || "none"} onValueChange={(value) => setFormData({ ...formData, age_category: value === "none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Category</SelectItem>
                          {AGE_CATEGORIES.map((age) => (
                            <SelectItem key={age} value={age}>{age.toUpperCase()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Max Teams
                      </Label>
                      <Input 
                        type="number" 
                        min={2} 
                        max={64}
                        value={formData.max_teams} 
                        onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) || 16 })} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tournament Format</Label>
                    <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TOURNAMENT_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex flex-col">
                              <span>{format.label}</span>
                              <span className="text-xs text-muted-foreground">{format.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Match Rules Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Match Rules Configuration
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Match Duration (min)</Label>
                      <Input 
                        type="number" 
                        min={20} 
                        max={120}
                        value={formData.match_duration_minutes} 
                        onChange={(e) => setFormData({ ...formData, match_duration_minutes: parseInt(e.target.value) || 90 })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Half-time (min)</Label>
                      <Input 
                        type="number" 
                        min={5} 
                        max={30}
                        value={formData.half_time_duration_minutes} 
                        onChange={(e) => setFormData({ ...formData, half_time_duration_minutes: parseInt(e.target.value) || 15 })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Substitutions</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        max={12}
                        value={formData.max_substitutions} 
                        onChange={(e) => setFormData({ ...formData, max_substitutions: parseInt(e.target.value) || 5 })} 
                      />
                    </div>
                  </div>

                  {showKnockoutOptions && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium">Knockout Stage Options</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Extra Time Duration (min)</Label>
                          <Input 
                            type="number" 
                            min={0} 
                            max={60}
                            value={formData.extra_time_duration_minutes} 
                            onChange={(e) => setFormData({ ...formData, extra_time_duration_minutes: parseInt(e.target.value) || 30 })} 
                          />
                        </div>
                        <div className="flex items-center justify-between space-x-2 pt-6">
                          <Label htmlFor="penalty-shootout" className="cursor-pointer">Enable Penalty Shootout</Label>
                          <Switch
                            id="penalty-shootout"
                            checked={formData.penalty_shootout}
                            onCheckedChange={(checked) => setFormData({ ...formData, penalty_shootout: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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
                    <TableHead>Age</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments?.map((tournament) => {
                    const t = tournament as any;
                    return (
                      <TableRow key={tournament.id}>
                        <TableCell className="font-medium">{tournament.name}</TableCell>
                        <TableCell>
                          {t.age_category ? (
                            <Badge variant="secondary">{t.age_category.toUpperCase()}</Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{getFormatBadge(t.format)}</TableCell>
                        <TableCell>{t.max_teams || "-"}</TableCell>
                        <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                        <TableCell>{tournament.start_date || "-"}</TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}