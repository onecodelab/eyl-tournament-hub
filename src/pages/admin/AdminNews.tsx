import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useNews } from "@/hooks/useSupabaseData";
import { useCreateNews, useUpdateNews, useDeleteNews } from "@/hooks/useAdminMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Newspaper, Star } from "lucide-react";
import { format } from "date-fns";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ADMIN_NEWS_CATEGORIES } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";

type News = Database["public"]["Tables"]["news"]["Row"];

export default function AdminNews() {
  const { data: news, isLoading } = useNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({ title: "", excerpt: "", content: "", category: "General", image_url: "", is_featured: false, published_at: "" });

  const resetForm = () => { setFormData({ title: "", excerpt: "", content: "", category: "General", image_url: "", is_featured: false, published_at: "" }); setEditingNews(null); };

  const handleEdit = (article: News) => {
    setEditingNews(article);
    setFormData({ title: article.title, excerpt: article.excerpt || "", content: article.content || "", category: article.category || "General", image_url: article.image_url || "", is_featured: article.is_featured || false, published_at: article.published_at ? article.published_at.slice(0, 16) : "" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) { toast({ title: "Error", description: "Title is required", variant: "destructive" }); return; }
    try {
      const data = { title: formData.title, excerpt: formData.excerpt || null, content: formData.content || null, category: formData.category, image_url: formData.image_url || null, is_featured: formData.is_featured, published_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString() };
      if (editingNews) { await updateNews.mutateAsync({ id: editingNews.id, ...data }); toast({ title: "Success", description: "Article updated" }); }
      else { await createNews.mutateAsync(data); toast({ title: "Success", description: "Article published" }); }
      setDialogOpen(false); resetForm();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteNews.mutateAsync(id); toast({ title: "Success", description: "Article deleted" }); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Newspaper}
          title="News"
          description="Manage news articles and publications"
          badge={<Badge variant="secondary" className="font-mono text-xs">{news?.length ?? 0}</Badge>}
          actions={
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Article</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editingNews ? "Edit Article" : "Create Article"}</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Article title" /></div>
                  <div className="space-y-2"><Label>Excerpt</Label><Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief summary" rows={2} /></div>
                  <div className="space-y-2"><Label>Content</Label><Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Full article content" rows={6} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ADMIN_NEWS_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Publish Date</Label><Input type="datetime-local" value={formData.published_at} onChange={(e) => setFormData({ ...formData, published_at: e.target.value })} /></div>
                  </div>
                  <ImageUpload label="Featured Image" value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} folder="news" />
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div><Label>Featured Article</Label><p className="text-xs text-muted-foreground">Show prominently on homepage</p></div>
                    <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={createNews.isPending || updateNews.isPending}>{editingNews ? "Update" : "Publish"} Article</Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-sm">Loading articles...</p></div>
            ) : news?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Newspaper className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">No articles found.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Title</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Category</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Published</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Featured</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news?.map((article) => (
                    <TableRow key={article.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium max-w-[240px] truncate">{article.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{article.category || "General"}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">{article.published_at ? format(new Date(article.published_at), "MMM d, yyyy") : "—"}</TableCell>
                      <TableCell>{article.is_featured && <Star className="h-4 w-4 text-eyl-gold fill-eyl-gold" />}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(article)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Article?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(article.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
