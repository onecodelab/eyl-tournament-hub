import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Newspaper, Star } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";
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
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "General",
    image_url: "",
    is_featured: false,
    published_at: "",
  });

  const resetForm = () => {
    setFormData({ title: "", excerpt: "", content: "", category: "General", image_url: "", is_featured: false, published_at: "" });
    setEditingNews(null);
  };

  const handleEdit = (article: News) => {
    setEditingNews(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content || "",
      category: article.category || "General",
      image_url: article.image_url || "",
      is_featured: article.is_featured || false,
      published_at: article.published_at ? article.published_at.slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    try {
      const data = {
        title: formData.title,
        excerpt: formData.excerpt || null,
        content: formData.content || null,
        category: formData.category,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured,
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString(),
      };
      if (editingNews) {
        await updateNews.mutateAsync({ id: editingNews.id, ...data });
        toast({ title: "Success", description: "Article updated successfully" });
      } else {
        await createNews.mutateAsync(data);
        toast({ title: "Success", description: "Article created successfully" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews.mutateAsync(id);
      toast({ title: "Success", description: "Article deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EYLLogo size={40} />
            <div>
              <h1 className="text-2xl font-bold">News</h1>
              <p className="text-muted-foreground">Manage news articles</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Edit Article" : "Create Article"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Article title" />
                </div>
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief summary" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Full article content" rows={6} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ADMIN_NEWS_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Publish Date</Label>
                    <Input type="datetime-local" value={formData.published_at} onChange={(e) => setFormData({ ...formData, published_at: e.target.value })} />
                  </div>
                </div>
                <ImageUpload
                  label="Featured Image"
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="news"
                />
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label>Featured Article</Label>
                    <p className="text-xs text-muted-foreground">Show prominently on homepage</p>
                  </div>
                  <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={createNews.isPending || updateNews.isPending}>
                  {editingNews ? "Update" : "Publish"} Article
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              All Articles ({news?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : news?.length === 0 ? (
              <p className="text-muted-foreground">No articles found. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news?.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{article.title}</TableCell>
                      <TableCell><Badge variant="outline">{article.category || "General"}</Badge></TableCell>
                      <TableCell>
                        {article.published_at ? format(new Date(article.published_at), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        {article.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
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
                              <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)}>Delete</AlertDialogAction>
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
