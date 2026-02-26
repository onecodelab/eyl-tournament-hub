import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAllSponsors, useCreateSponsor, useUpdateSponsor, useDeleteSponsor, Sponsor } from "@/hooks/useSponsors";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2, ExternalLink, Handshake } from "lucide-react";
import { toast } from "sonner";

export default function AdminSponsors() {
  const { data: sponsors = [], isLoading } = useAllSponsors();
  const createSponsor = useCreateSponsor();
  const updateSponsor = useUpdateSponsor();
  const deleteSponsor = useDeleteSponsor();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({ name: "", logo_url: "", website_url: "", type: "Official Partner", position: "both", display_order: 0, is_active: true });

  const resetForm = () => { setFormData({ name: "", logo_url: "", website_url: "", type: "Official Partner", position: "both", display_order: 0, is_active: true }); setEditingSponsor(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSponsor) { await updateSponsor.mutateAsync({ id: editingSponsor.id, ...formData }); toast.success("Sponsor updated"); }
      else { await createSponsor.mutateAsync(formData); toast.success("Sponsor created"); }
      setIsDialogOpen(false); resetForm();
    } catch { toast.error("Failed to save sponsor"); }
  };

  const handleEdit = (sponsor: Sponsor) => { setEditingSponsor(sponsor); setFormData({ name: sponsor.name, logo_url: sponsor.logo_url || "", website_url: sponsor.website_url || "", type: sponsor.type || "Official Partner", position: sponsor.position || "both", display_order: sponsor.display_order || 0, is_active: sponsor.is_active ?? true }); setIsDialogOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("Delete this sponsor?")) { try { await deleteSponsor.mutateAsync(id); toast.success("Sponsor deleted"); } catch { toast.error("Failed to delete"); } } };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Handshake}
          title="Sponsors"
          description="Manage partner logos and sponsorship deals"
          badge={<Badge variant="secondary" className="font-mono text-xs">{sponsors.length}</Badge>}
          actions={
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Sponsor</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editingSponsor ? "Edit Sponsor" : "Add New Sponsor"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Ethio Telecom" /></div>
                  <ImageUpload label="Logo" value={formData.logo_url} onChange={(url) => setFormData({ ...formData, logo_url: url })} bucket="hero-images" />
                  <div className="space-y-2"><Label>Website URL</Label><Input value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://example.com" type="url" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Type</Label><Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Lead Partner">Lead Partner</SelectItem><SelectItem value="Official Partner">Official Partner</SelectItem><SelectItem value="Official Bank">Official Bank</SelectItem><SelectItem value="Official Carrier">Official Carrier</SelectItem><SelectItem value="Official Sponsor">Official Sponsor</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Position</Label><Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="top">Top Only</SelectItem><SelectItem value="bottom">Footer Only</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} /></div>
                    <div className="space-y-2"><Label>Active</Label><div className="pt-2"><Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} /></div></div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit">{editingSponsor ? "Update" : "Create"}</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-sm">Loading sponsors...</p></div>
            ) : sponsors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Handshake className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">No sponsors found.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Logo</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Type</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Position</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Order</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.map((sponsor) => (
                    <TableRow key={sponsor.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                      <TableCell>{sponsor.logo_url ? <img src={sponsor.logo_url} alt={sponsor.name} className="h-8 w-auto object-contain" /> : <div className="h-8 w-16 bg-muted/50 rounded flex items-center justify-center text-[10px] text-muted-foreground">No logo</div>}</TableCell>
                      <TableCell className="font-medium">{sponsor.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{sponsor.type}</Badge></TableCell>
                      <TableCell className="capitalize text-muted-foreground text-sm">{sponsor.position}</TableCell>
                      <TableCell className="font-mono text-sm">{sponsor.display_order}</TableCell>
                      <TableCell>{sponsor.is_active ? <Badge className="bg-eyl-success/10 text-eyl-success border-eyl-success/30 text-xs">Active</Badge> : <Badge variant="outline" className="text-xs text-destructive border-destructive/30">Inactive</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {sponsor.website_url && <Button variant="ghost" size="icon" className="h-8 w-8" asChild><a href={sponsor.website_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(sponsor)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(sponsor.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
