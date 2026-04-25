import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useTournaments } from "@/hooks/useSupabaseData";
import { useCreateTournament, useUpdateTournament, useDeleteTournament } from "@/hooks/useAdminMutations";
import { useTHOAdminUsers, useTournamentAdmins } from "@/hooks/useTHOAdminUsers";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "upcoming",
    logo_url: "",
    // Tournament configuration fields
    age_category: "",
    format: "league",
    max_teams: 16,
    match_duration_minutes: 90,
    half_time_duration_minutes: 15,
    max_substitutions: 5,
    extra_time_duration_minutes: 30,
    penalty_shootout: true,
    // Group+Knockout specific fields
    num_groups: 2,
    teams_per_group: 4,
    teams_qualifying_per_group: 2,
  });

  // Fetch current assigned admins when editing
  const { data: currentAdmins } = useTournamentAdmins(editingTournament?.id);
  
  useEffect(() => {
    if (currentAdmins) {
      setSelectedAdminIds(currentAdmins);
    } else {
      setSelectedAdminIds([]);
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
      num_groups: 2,
      teams_per_group: 4,
      teams_qualifying_per_group: 2,
    });
    setEditingTournament(null);
    setSelectedAdminIds([]);
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
      num_groups: tournamentData.num_groups || 2,
      teams_per_group: tournamentData.teams_per_group || 4,
      teams_qualifying_per_group: tournamentData.teams_qualifying_per_group || 2,
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
      // Group+Knockout specific fields
      num_groups: formData.format === "group_knockout" ? formData.num_groups : null,
      teams_per_group: formData.format === "group_knockout" ? formData.teams_per_group : null,
      teams_qualifying_per_group: formData.format === "group_knockout" ? formData.teams_qualifying_per_group : null,
    };

    try {
      if (editingTournament) {
        await updateTournament.mutateAsync({ id: editingTournament.id, ...tournamentData } as any);
        
        // Update tournament admin assignments
        if (selectedAdminIds.length >= 0) {
          // Always clear and re-add for simplicity in a many-to-many relationship
          await supabase
            .from("tournament_admins")
            .delete()
            .eq("tournament_id", editingTournament.id);
          
          if (selectedAdminIds.length > 0) {
            const adminInserts = selectedAdminIds.map(userId => ({
              tournament_id: editingTournament.id,
              user_id: userId
            }));
            
            await supabase
              .from("tournament_admins")
              .insert(adminInserts);
          }
        }
        
        toast({ title: "Success", description: "Tournament updated successfully" });
      } else {
        const result = await createTournament.mutateAsync(tournamentData as any);
        
        if (selectedAdminIds.length > 0 && result?.id) {
          const adminInserts = selectedAdminIds.map(userId => ({
            tournament_id: result.id,
            user_id: userId
          }));
          
          await supabase
            .from("tournament_admins")
            .insert(adminInserts);
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
        <AdminPageHeader
          icon={Trophy}
          title="Tournaments"
          description="Manage league tournaments and configurations"
          badge={<Badge variant="secondary" className="font-mono text-xs">{tournaments?.length ?? 0}</Badge>}
          actions={
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Tournament</Button>
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
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Assign THO Admins (Multiple)
                    </Label>
                    <Card className="bg-muted/30 border-dashed">
                      <CardContent className="p-3">
                        <ScrollArea className="h-[120px] pr-4">
                          <div className="space-y-2">
                            {thoAdminUsers?.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No THO Admin users found. Create one in User Roles first.
                              </p>
                            ) : (
                              thoAdminUsers?.map((admin) => (
                                <div key={admin.user_id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                                  <Checkbox 
                                    id={`admin-${admin.user_id}`}
                                    checked={selectedAdminIds.includes(admin.user_id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedAdminIds([...selectedAdminIds, admin.user_id]);
                                      } else {
                                        setSelectedAdminIds(selectedAdminIds.filter(id => id !== admin.user_id));
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor={`admin-${admin.user_id}`}
                                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                                  >
                                    {admin.display_name}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                    {selectedAdminIds.length > 0 && (
                      <p className="text-[10px] text-primary font-medium">
                        {selectedAdminIds.length} admin(s) selected
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

                  {/* Group+Knockout Configuration */}
                  {formData.format === "group_knockout" && (
                    <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Group Stage Configuration
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Number of Groups</Label>
                          <Input 
                            type="number" 
                            min={2} 
                            max={8}
                            value={formData.num_groups} 
                            onChange={(e) => setFormData({ ...formData, num_groups: parseInt(e.target.value) || 2 })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Teams per Group</Label>
                          <Input 
                            type="number" 
                            min={2} 
                            max={8}
                            value={formData.teams_per_group} 
                            onChange={(e) => setFormData({ ...formData, teams_per_group: parseInt(e.target.value) || 4 })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Teams Qualifying</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            max={formData.teams_per_group - 1}
                            value={formData.teams_qualifying_per_group} 
                            onChange={(e) => setFormData({ ...formData, teams_qualifying_per_group: parseInt(e.target.value) || 2 })} 
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total teams needed: {formData.num_groups * formData.teams_per_group} | 
                        Teams advancing: {formData.num_groups * formData.teams_qualifying_per_group}
                      </p>
                    </div>
                  )}
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
          }
        />

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-sm">Loading tournaments...</p></div>
            ) : tournaments?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Trophy className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">No tournaments found.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Age</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Format</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Teams</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Start Date</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments?.map((tournament) => {
                    const t = tournament as any;
                    return (
                      <TableRow key={tournament.id} className="border-border/20 hover:bg-muted/30 transition-colors">
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(tournament)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
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
                        </div></TableCell>
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