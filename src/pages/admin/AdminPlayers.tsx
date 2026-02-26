import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { usePlayers, useTeams } from "@/hooks/useSupabaseData";
import { useCreatePlayer, useUpdatePlayer, useDeletePlayer } from "@/hooks/useAdminMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, UserCircle } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Database } from "@/integrations/supabase/types";

type Player = Database["public"]["Tables"]["players"]["Row"];

export default function AdminPlayers() {
  const { data: players, isLoading } = usePlayers();
  const { data: teams } = useTeams();
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({ name: "", position: "", jersey_number: "", team_id: "", photo_url: "" });

  const resetForm = () => { setFormData({ name: "", position: "", jersey_number: "", team_id: "", photo_url: "" }); setEditingPlayer(null); };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({ name: player.name, position: player.position || "", jersey_number: player.jersey_number?.toString() || "", team_id: player.team_id || "", photo_url: player.photo_url || "" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast({ title: "Error", description: "Name is required", variant: "destructive" }); return; }
    try {
      const data = { name: formData.name, position: formData.position || null, jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null, team_id: formData.team_id || null, photo_url: formData.photo_url || null };
      if (editingPlayer) { await updatePlayer.mutateAsync({ id: editingPlayer.id, ...data }); toast({ title: "Success", description: "Player updated" }); }
      else { await createPlayer.mutateAsync(data); toast({ title: "Success", description: "Player created" }); }
      setDialogOpen(false); resetForm();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try { await deletePlayer.mutateAsync(id); toast({ title: "Success", description: "Player deleted" }); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const getTeamName = (teamId: string | null) => { if (!teamId) return "—"; return teams?.find(t => t.id === teamId)?.name || "—"; };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={UserCircle}
          title="Players"
          description="Manage league players and rosters"
          badge={<Badge variant="secondary" className="font-mono text-xs">{players?.length ?? 0}</Badge>}
          actions={
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Player</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{editingPlayer ? "Edit Player" : "Create Player"}</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-visible">
                  <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Player name" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Position</Label>
                      <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="Forward">Forward</SelectItem><SelectItem value="Midfielder">Midfielder</SelectItem><SelectItem value="Defender">Defender</SelectItem><SelectItem value="Goalkeeper">Goalkeeper</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Jersey #</Label><Input type="number" value={formData.jersey_number} onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })} placeholder="10" /></div>
                  </div>
                  <div className="space-y-2"><Label>Team</Label>
                    <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
                      <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                      <SelectContent>{teams?.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <ImageUpload label="Player Photo" value={formData.photo_url} onChange={(url) => setFormData({ ...formData, photo_url: url })} folder="players" />
                  <Button onClick={handleSubmit} className="w-full" disabled={createPlayer.isPending || updatePlayer.isPending}>{editingPlayer ? "Update" : "Create"} Player</Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-sm">Loading players...</p></div>
            ) : players?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><UserCircle className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">No players found.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Position</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Team</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Goals</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Assists</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players?.map((player) => (
                    <TableRow key={player.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>{player.position ? <Badge variant="outline" className="text-xs">{player.position}</Badge> : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{getTeamName(player.team_id)}</TableCell>
                      <TableCell className="font-mono text-sm">{player.goals ?? 0}</TableCell>
                      <TableCell className="font-mono text-sm">{player.assists ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(player)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Player?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(player.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
