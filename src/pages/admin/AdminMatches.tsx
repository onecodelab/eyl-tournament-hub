import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAllMatches, useTeams, useTournaments } from "@/hooks/useSupabaseData";
import { useCreateMatch, useUpdateMatch, useDeleteMatch } from "@/hooks/useAdminMutations";
import { useRefereesWithEmail } from "@/hooks/useReferees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Match = Database["public"]["Tables"]["matches"]["Row"];

export default function AdminMatches() {
  const { data: matches, isLoading } = useAllMatches();
  const { data: teams } = useTeams();
  const { data: tournaments } = useTournaments();
  const { data: referees } = useRefereesWithEmail();
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({ home_team_id: "", away_team_id: "", tournament_id: "", match_date: "", venue: "", status: "scheduled", home_score: "", away_score: "", tagline: "", referee_id: "" });

  const resetForm = () => { setFormData({ home_team_id: "", away_team_id: "", tournament_id: "", match_date: "", venue: "", status: "scheduled", home_score: "", away_score: "", tagline: "", referee_id: "" }); setEditingMatch(null); };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({ home_team_id: match.home_team_id || "", away_team_id: match.away_team_id || "", tournament_id: match.tournament_id || "", match_date: match.match_date ? match.match_date.slice(0, 16) : "", venue: match.venue || "", status: match.status || "scheduled", home_score: match.home_score?.toString() || "", away_score: match.away_score?.toString() || "", tagline: match.tagline || "", referee_id: match.referee_id || "" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.home_team_id || !formData.away_team_id) { toast({ title: "Error", description: "Both teams are required", variant: "destructive" }); return; }
    try {
      const data = { home_team_id: formData.home_team_id || null, away_team_id: formData.away_team_id || null, tournament_id: formData.tournament_id || null, match_date: formData.match_date ? new Date(formData.match_date).toISOString() : null, venue: formData.venue || null, status: formData.status, home_score: formData.home_score ? parseInt(formData.home_score) : null, away_score: formData.away_score ? parseInt(formData.away_score) : null, tagline: formData.tagline || null, referee_id: formData.referee_id || null };
      if (editingMatch) { await updateMatch.mutateAsync({ id: editingMatch.id, ...data }); toast({ title: "Success", description: "Match updated" }); }
      else { await createMatch.mutateAsync(data); toast({ title: "Success", description: "Match created" }); }
      setDialogOpen(false); resetForm();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteMatch.mutateAsync(id); toast({ title: "Success", description: "Match deleted" }); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const getTeamName = (teamId: string | null) => { if (!teamId) return "TBD"; return teams?.find(t => t.id === teamId)?.short_name || teams?.find(t => t.id === teamId)?.name || "TBD"; };
  const getRefereeName = (refereeId: string | null) => { if (!refereeId) return null; return referees?.find(r => r.user_id === refereeId)?.email || null; };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "live": return <Badge className="bg-eyl-live/10 text-eyl-live border-eyl-live/30 text-xs">Live</Badge>;
      case "completed": return <Badge variant="secondary" className="text-xs">Completed</Badge>;
      case "postponed": return <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">Postponed</Badge>;
      default: return <Badge variant="outline" className="text-xs">Scheduled</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Calendar}
          title="Matches"
          description="Schedule and manage league matches"
          badge={<Badge variant="secondary" className="font-mono text-xs">{matches?.length ?? 0}</Badge>}
          actions={
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Match</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{editingMatch ? "Edit Match" : "Create Match"}</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Home Team *</Label><Select value={formData.home_team_id} onValueChange={(value) => setFormData({ ...formData, home_team_id: value })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{teams?.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Away Team *</Label><Select value={formData.away_team_id} onValueChange={(value) => setFormData({ ...formData, away_team_id: value })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{teams?.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent></Select></div>
                  </div>
                  <div className="space-y-2"><Label>Tournament</Label><Select value={formData.tournament_id} onValueChange={(value) => setFormData({ ...formData, tournament_id: value })}><SelectTrigger><SelectValue placeholder="Select tournament" /></SelectTrigger><SelectContent>{tournaments?.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Match Date & Time</Label><Input type="datetime-local" value={formData.match_date} onChange={(e) => setFormData({ ...formData, match_date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Venue</Label><Input value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} placeholder="Stadium name" /></div>
                  <div className="space-y-2"><Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="postponed">Postponed</SelectItem></SelectContent></Select>
                    <p className="text-xs text-muted-foreground">Only referees can set matches to "Live" or "Completed".</p>
                  </div>
                  <div className="space-y-2"><Label>Tagline</Label><Textarea value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="Match description" /></div>
                  <div className="space-y-2"><Label className="flex items-center gap-2"><User className="h-4 w-4" /> Assign Referee</Label>
                    <Select value={formData.referee_id} onValueChange={(value) => setFormData({ ...formData, referee_id: value })}><SelectTrigger><SelectValue placeholder="Select referee" /></SelectTrigger><SelectContent>{referees?.length === 0 && (<p className="text-sm text-muted-foreground p-2">No referees available. Create referee users in User Roles first.</p>)}{referees?.map((r) => (<SelectItem key={r.id} value={r.user_id}>{r.email}</SelectItem>))}</SelectContent></Select>
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={createMatch.isPending || updateMatch.isPending}>{editingMatch ? "Update" : "Create"} Match</Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-sm">Loading matches...</p></div>
            ) : matches?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Calendar className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">No matches found.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Match</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Date</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Venue</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Referee</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Score</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches?.map((match) => (
                    <TableRow key={match.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">{match.match_date ? format(new Date(match.match_date), "MMM d, yyyy HH:mm") : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{match.venue || "—"}</TableCell>
                      <TableCell>{match.referee_id ? <Badge variant="outline" className="gap-1 text-xs"><User className="h-3 w-3" />{getRefereeName(match.referee_id) || "Assigned"}</Badge> : <span className="text-muted-foreground text-xs">Unassigned</span>}</TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell className="font-mono font-bold">{match.status === "completed" ? `${match.home_score ?? 0} - ${match.away_score ?? 0}` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(match)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Match?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(match.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                          </AlertDialog>
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
    </AdminLayout>
  );
}
