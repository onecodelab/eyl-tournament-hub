import { useState } from "react";
import { THOAdminLayout } from "@/components/admin/THOAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useVideos } from "@/hooks/useSupabaseData";
import { useCreateVideo, useUpdateVideo, useDeleteVideo } from "@/hooks/useAdminMutations";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { useToast } from "@/hooks/use-toast";
import { Video, Plus, Edit, Trash2, ExternalLink } from "lucide-react";

export default function THOVideos() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const { data: allVideos = [], isLoading } = useVideos();
  const { assignedTournaments } = useTournamentAdmin();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    thumbnail_url: "",
    is_featured: false,
  });

  // Filter videos by selected tournament
  const videos = allVideos.filter((v: any) => v.tournament_id === selectedTournamentId);

  const selectedTournament = assignedTournaments.find(
    (t: any) => t.id === selectedTournamentId
  );

  const resetForm = () => {
    setFormData({
      title: "",
      youtube_url: "",
      thumbnail_url: "",
      is_featured: false,
    });
    setEditingVideo(null);
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || "",
      youtube_url: video.youtube_url || "",
      thumbnail_url: video.thumbnail_url || "",
      is_featured: video.is_featured || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.youtube_url) {
      toast({
        title: "Validation Error",
        description: "Title and YouTube URL are required.",
        variant: "destructive",
      });
      return;
    }

    const videoData = {
      ...formData,
      tournament_id: selectedTournamentId,
    };

    try {
      if (editingVideo) {
        await updateVideo.mutateAsync({ id: editingVideo.id, ...videoData });
        toast({ title: "Video updated successfully" });
      } else {
        await createVideo.mutateAsync(videoData);
        toast({ title: "Video created successfully" });
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
      await deleteVideo.mutateAsync(id);
      toast({ title: "Video deleted successfully" });
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
            <Video className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Videos Management</h1>
              <p className="text-muted-foreground">
                {selectedTournament ? `Managing videos for ${(selectedTournament as any).name}` : "Select a tournament"}
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!selectedTournamentId}>
                <Plus className="h-4 w-4" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingVideo ? "Edit Video" : "Add Video"}</DialogTitle>
                <DialogDescription>
                  {editingVideo ? "Update video details" : "Add a new video from YouTube"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Video title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube URL *</Label>
                    <Input
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thumbnail URL</Label>
                    <Input
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="Custom thumbnail (optional)"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label>Featured Video</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createVideo.isPending || updateVideo.isPending}>
                    {editingVideo ? "Update" : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Videos Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Videos</CardTitle>
            <CardDescription>
              {videos.length} videos for this tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : !selectedTournamentId ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Video className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select a tournament to manage videos</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Video className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No videos. Add your first one!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video: any) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="h-10 w-16 object-cover rounded" />
                        ) : (
                          <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                            <Video className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{video.title}</span>
                          <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(video.published_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {video.is_featured && <Badge>Featured</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(video.id)}
                            disabled={deleteVideo.isPending}
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
