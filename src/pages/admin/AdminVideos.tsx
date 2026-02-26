import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Video, ExternalLink } from "lucide-react";
import { useVideos } from "@/hooks/useSupabaseData";
import { useCreateVideo, useUpdateVideo, useDeleteVideo } from "@/hooks/useAdminMutations";
import { toast } from "sonner";

interface VideoForm { title: string; youtube_url: string; thumbnail_url: string; views_count: number; is_featured: boolean; }
const initialForm: VideoForm = { title: "", youtube_url: "", thumbnail_url: "", views_count: 0, is_featured: false };

const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/];
  for (const pattern of patterns) { const match = url.match(pattern); if (match) return match[1]; }
  return null;
};

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function AdminVideos() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoForm>(initialForm);
  const { data: videos = [], isLoading } = useVideos();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();

  const resetForm = () => { setForm(initialForm); setEditingId(null); };
  const handleYouTubeUrlChange = (url: string) => { const videoId = extractYouTubeVideoId(url); const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ""; setForm({ ...form, youtube_url: url, thumbnail_url: thumbnail }); };
  const handleEdit = (video: any) => { setForm({ title: video.title, youtube_url: video.youtube_url, thumbnail_url: video.thumbnail_url || "", views_count: video.views_count || 0, is_featured: video.is_featured || false }); setEditingId(video.id); setOpen(true); };

  const handleSubmit = async () => {
    if (!form.title || !form.youtube_url) { toast.error("Title and YouTube URL are required"); return; }
    try {
      if (editingId) { await updateVideo.mutateAsync({ id: editingId, ...form }); toast.success("Video updated"); }
      else { await createVideo.mutateAsync(form); toast.success("Video added"); }
      setOpen(false); resetForm();
    } catch { toast.error("Failed to save video"); }
  };

  const handleDelete = async (id: string) => { if (confirm("Delete this video?")) { try { await deleteVideo.mutateAsync(id); toast.success("Video deleted"); } catch { toast.error("Failed to delete"); } } };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Video}
          title="Videos"
          description="Manage video content and highlights"
          badge={<Badge variant="secondary" className="font-mono text-xs">{videos.length}</Badge>}
          actions={
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Video</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{editingId ? "Edit Video" : "Add New Video"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" /></div>
                  <div className="space-y-2"><Label>YouTube URL *</Label><Input value={form.youtube_url} onChange={(e) => handleYouTubeUrlChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
                  <div className="space-y-2"><Label>Thumbnail (auto-generated)</Label><Input value={form.thumbnail_url} readOnly className="bg-muted/30" />{form.thumbnail_url && <img src={form.thumbnail_url} alt="Preview" className="mt-2 rounded-lg w-full h-32 object-cover" />}</div>
                  <div className="space-y-2"><Label>Views Count</Label><Input type="number" value={form.views_count} onChange={(e) => setForm({ ...form, views_count: parseInt(e.target.value) || 0 })} /></div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"><Switch checked={form.is_featured} onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })} /><Label>Featured Video</Label></div>
                  <Button onClick={handleSubmit} className="w-full">{editingId ? "Update" : "Add"} Video</Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-sm">Loading videos...</p></div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Video className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">No videos yet.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Title</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Link</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Views</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Featured</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium"><div className="flex items-center gap-2"><Video className="h-4 w-4 text-primary shrink-0" /><span className="truncate max-w-[200px]">{video.title}</span></div></TableCell>
                      <TableCell><a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">Open <ExternalLink className="h-3 w-3" /></a></TableCell>
                      <TableCell className="font-mono text-sm">{formatViews(video.views_count || 0)}</TableCell>
                      <TableCell>{video.is_featured ? <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Yes</Badge> : <span className="text-muted-foreground text-xs">No</span>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(video)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(video.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
