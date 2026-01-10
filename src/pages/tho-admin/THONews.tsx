import { useState } from "react";
import { THOAdminLayout } from "@/components/admin/THOAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNews } from "@/hooks/useSupabaseData";
import { useCreateNews, useUpdateNews, useDeleteNews } from "@/hooks/useAdminMutations";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Newspaper, Plus, Edit, Trash2 } from "lucide-react";

export default function THONews() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const { data: allNews = [], isLoading } = useNews();
  const { assignedTournaments } = useTournamentAdmin();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "Tournament",
    is_featured: false,
  });

  // Filter news by selected tournament
  const news = allNews.filter((n: any) => n.tournament_id === selectedTournamentId);

  const selectedTournament = assignedTournaments.find(
    (t: any) => t.id === selectedTournamentId
  );

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image_url: "",
      category: "Tournament",
      is_featured: false,
    });
    setEditingNews(null);
  };

  const handleEdit = (article: any) => {
    setEditingNews(article);
    setFormData({
      title: article.title || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      image_url: article.image_url || "",
      category: article.category || "Tournament",
      is_featured: article.is_featured || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }

    const newsData = {
      ...formData,
      tournament_id: selectedTournamentId,
    };

    try {
      if (editingNews) {
        await updateNews.mutateAsync({ id: editingNews.id, ...newsData });
        toast({ title: "News updated successfully" });
      } else {
        await createNews.mutateAsync(newsData);
        toast({ title: "News created successfully" });
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
      await deleteNews.mutateAsync(id);
      toast({ title: "News deleted successfully" });
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
            <Newspaper className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">News Management</h1>
              <p className="text-muted-foreground">
                {selectedTournament ? `Managing news for ${(selectedTournament as any).name}` : "Select a tournament"}
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!selectedTournamentId}>
                <Plus className="h-4 w-4" />
                Add News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Edit News" : "Add News Article"}</DialogTitle>
                <DialogDescription>
                  {editingNews ? "Update article details" : "Create a new news article"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Article title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Excerpt</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief summary"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Full article content"
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Tournament, Match Report"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label>Featured Article</Label>
                  </div>
                  <div className="space-y-2">
                    <ImageUpload
                      label="Cover Image"
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      bucket="hero-images"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createNews.isPending || updateNews.isPending}>
                    {editingNews ? "Update" : "Publish"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* News Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>News Articles</CardTitle>
            <CardDescription>
              {news.length} articles for this tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : !selectedTournamentId ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select a tournament to manage news</p>
              </div>
            ) : news.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No news articles. Create your first one!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((article: any) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="h-10 w-14 object-cover rounded" />
                        ) : (
                          <div className="h-10 w-14 bg-muted rounded flex items-center justify-center">
                            <Newspaper className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{article.title}</TableCell>
                      <TableCell>{article.category || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(article.published_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {article.is_featured && <Badge>Featured</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(article.id)}
                            disabled={deleteNews.isPending}
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
