import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Video, ExternalLink } from "lucide-react";
import { useVideos } from "@/hooks/useSupabaseData";
import { useCreateVideo, useUpdateVideo, useDeleteVideo } from "@/hooks/useAdminMutations";
import { toast } from "sonner";

interface VideoForm {
  title: string;
  youtube_url: string;
  thumbnail_url: string;
  views_count: number;
  is_featured: boolean;
}

const initialForm: VideoForm = {
  title: "",
  youtube_url: "",
  thumbnail_url: "",
  views_count: 0,
  is_featured: false,
};

export default function AdminVideos() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoForm>(initialForm);

  const { data: videos = [], isLoading } = useVideos();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleEdit = (video: any) => {
    setForm({
      title: video.title,
      youtube_url: video.youtube_url,
      thumbnail_url: video.thumbnail_url || "",
      views_count: video.views_count || 0,
      is_featured: video.is_featured || false,
    });
    setEditingId(video.id);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.youtube_url) {
      toast.error("Title and YouTube URL are required");
      return;
    }

    try {
      if (editingId) {
        await updateVideo.mutateAsync({ id: editingId, ...form });
        toast.success("Video updated successfully");
      } else {
        await createVideo.mutateAsync(form);
        toast.success("Video added successfully");
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save video");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo.mutateAsync(id);
        toast.success("Video deleted successfully");
      } catch (error) {
        toast.error("Failed to delete video");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Videos</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Video" : "Add New Video"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Video title"
                />
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube URL *</Label>
                <Input
                  id="youtube_url"
                  value={form.youtube_url}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnail_url"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <Label htmlFor="views_count">Views Count</Label>
                <Input
                  id="views_count"
                  type="number"
                  value={form.views_count}
                  onChange={(e) => setForm({ ...form, views_count: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={form.is_featured}
                  onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured Video</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingId ? "Update Video" : "Add Video"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>YouTube URL</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No videos yet. Add your first video!
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      {video.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a 
                      href={video.youtube_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>{formatViews(video.views_count || 0)}</TableCell>
                  <TableCell>
                    {video.is_featured ? (
                      <span className="text-primary font-semibold">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(video.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
