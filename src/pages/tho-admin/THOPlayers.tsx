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
import { useTeams, usePlayers } from "@/hooks/useSupabaseData";
import { useCreatePlayer, useUpdatePlayer, useDeletePlayer, useBulkCreatePlayers } from "@/hooks/useAdminMutations";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CSVImportDialog } from "@/components/admin/CSVImportDialog";
import { parseCSV, generatePlayersCSVTemplate } from "@/utils/csvParser";
import { UserCircle, Plus, Edit, Trash2, Filter } from "lucide-react";

export default function THOPlayers() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const { data: allTeams = [] } = useTeams();
  const { data: allPlayers = [], isLoading } = usePlayers();
  const { assignedTournaments } = useTournamentAdmin();
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const bulkCreatePlayers = useBulkCreatePlayers();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    team_id: "",
    jersey_number: "",
    position: "",
    nationality: "",
    photo_url: "",
    fayda_number: "",
  });

  // Filter teams by selected tournament
  const teams = allTeams.filter((t: any) => t.tournament_id === selectedTournamentId);
  const teamIds = teams.map((t: any) => t.id);
  
  // Filter players by teams in the tournament
  const tournamentPlayers = allPlayers.filter((p: any) => teamIds.includes(p.team_id));
  
  // Apply team filter
  const players = useMemo(() => {
    if (selectedTeamFilter === "all") {
      return tournamentPlayers;
    }
    return tournamentPlayers.filter((p: any) => p.team_id === selectedTeamFilter);
  }, [tournamentPlayers, selectedTeamFilter]);

  const selectedTournament = assignedTournaments.find(
    (t: any) => t.id === selectedTournamentId
  );

  const resetForm = () => {
    setFormData({
      name: "",
      team_id: "",
      jersey_number: "",
      position: "",
      nationality: "",
      photo_url: "",
      fayda_number: "",
    });
    setEditingPlayer(null);
  };

  const handleEdit = (player: any) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name || "",
      team_id: player.team_id || "",
      jersey_number: player.jersey_number?.toString() || "",
      position: player.position || "",
      nationality: player.nationality || "",
      photo_url: player.photo_url || "",
      fayda_number: player.fayda_number || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.team_id) {
      toast({
        title: "Validation Error",
        description: "Player name and team are required.",
        variant: "destructive",
      });
      return;
    }

    const playerData = {
      ...formData,
      jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
      fayda_number: formData.fayda_number || null,
    };

    try {
      if (editingPlayer) {
        await updatePlayer.mutateAsync({ id: editingPlayer.id, ...playerData });
        toast({ title: "Player updated successfully" });
      } else {
        await createPlayer.mutateAsync(playerData);
        toast({ title: "Player created successfully" });
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
      await deletePlayer.mutateAsync(id);
      toast({ title: "Player deleted successfully" });
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
    return team?.name || "Unknown";
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
            <UserCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Players Management</h1>
              <p className="text-muted-foreground">
                {selectedTournament ? `Managing players for ${(selectedTournament as any).name}` : "Select a tournament"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CSVImportDialog
              title="Import Players from CSV"
              description="Upload a CSV file to bulk import players. Use team names (must match existing teams)."
              templateGenerator={generatePlayersCSVTemplate}
              templateFilename="players_template.csv"
              disabled={!selectedTournamentId || teams.length === 0}
              onImport={async (file) => {
                const text = await file.text();
                const result = parseCSV<{
                  name: string;
                  team_name: string;
                  jersey_number: string;
                  position: string;
                  nationality: string;
                  fayda_number: string;
                }>(
                  text,
                  {
                    name: "name",
                    team_name: "team_name",
                    jersey_number: "jersey_number",
                    position: "position",
                    nationality: "nationality",
                    fayda_number: "fayda_number",
                  },
                  ["name", "team_name"]
                );

                if (result.data.length === 0) {
                  return { success: 0, errors: result.errors.length > 0 ? result.errors : ["No valid players found in CSV"] };
                }

                // Map team names to team IDs
                const errors: string[] = [...result.errors];
                const playersToInsert: any[] = [];

                for (let i = 0; i < result.data.length; i++) {
                  const row = result.data[i];
                  const team = teams.find((t: any) => 
                    t.name.toLowerCase() === row.team_name?.toLowerCase()
                  );

                  if (!team) {
                    errors.push(`Row ${i + 2}: Team "${row.team_name}" not found`);
                    continue;
                  }

                  playersToInsert.push({
                    name: row.name,
                    team_id: team.id,
                    jersey_number: row.jersey_number ? parseInt(row.jersey_number) : null,
                    position: row.position || null,
                    nationality: row.nationality || null,
                    fayda_number: row.fayda_number || null,
                  });
                }

                if (playersToInsert.length === 0) {
                  return { success: 0, errors: errors.length > 0 ? errors : ["No valid players to import"] };
                }

                try {
                  await bulkCreatePlayers.mutateAsync(playersToInsert);
                  toast({ title: `Successfully imported ${playersToInsert.length} players` });
                  return { success: playersToInsert.length, errors };
                } catch (error: any) {
                  return { success: 0, errors: [error.message || "Failed to import players"] };
                }
              }}
            />
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={!selectedTournamentId || teams.length === 0}>
                  <Plus className="h-4 w-4" />
                  Add Player
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{editingPlayer ? "Edit Player" : "Add New Player"}</DialogTitle>
                <DialogDescription>
                  {editingPlayer ? "Update player details" : "Add a new player to a team"}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 max-h-[60vh]">
                <form onSubmit={handleSubmit} id="player-form">
                  <div className="space-y-4 py-4 pr-4">
                  <div className="space-y-2">
                    <Label>Player Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter player name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Team *</Label>
                    <Select value={formData.team_id} onValueChange={(val) => setFormData({ ...formData, team_id: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team: any) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Jersey Number</Label>
                      <Input
                        type="number"
                        value={formData.jersey_number}
                        onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={formData.position} onValueChange={(val) => setFormData({ ...formData, position: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                          <SelectItem value="Defender">Defender</SelectItem>
                          <SelectItem value="Midfielder">Midfielder</SelectItem>
                          <SelectItem value="Forward">Forward</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Fayda Number Field */}
                  <div className="space-y-2">
                    <Label>Fayda Number</Label>
                    <Input
                      value={formData.fayda_number}
                      onChange={(e) => setFormData({ ...formData, fayda_number: e.target.value })}
                      placeholder="Enter Fayda number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Input
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="e.g. Ethiopian"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <ImageUpload
                      label="Player Photo"
                      value={formData.photo_url}
                      onChange={(url) => setFormData({ ...formData, photo_url: url })}
                      bucket="hero-images"
                    />
                  </div>
                  </div>
                </form>
              </ScrollArea>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="player-form" disabled={createPlayer.isPending || updatePlayer.isPending}>
                  {editingPlayer ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Players Table */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Players</CardTitle>
                <CardDescription>
                  {players.length} players {selectedTeamFilter !== "all" ? `in selected team` : `across ${teams.length} teams`}
                </CardDescription>
              </div>
              
              {/* Team Filter */}
              {selectedTournamentId && teams.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team: any) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : !selectedTournamentId ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select a tournament to manage players</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Add teams first before adding players</p>
              </div>
            ) : players.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {selectedTeamFilter !== "all" 
                    ? "No players in the selected team" 
                    : "No players found. Add your first player!"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Fayda No.</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player: any) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        {player.photo_url ? (
                          <img src={player.photo_url} alt={player.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                            <UserCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>{getTeamName(player.team_id)}</TableCell>
                      <TableCell>{player.jersey_number || "-"}</TableCell>
                      <TableCell>{player.position || "-"}</TableCell>
                      <TableCell>{player.fayda_number || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(player)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(player.id)}
                            disabled={deletePlayer.isPending}
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