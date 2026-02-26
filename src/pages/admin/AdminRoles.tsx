import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUserRoles } from "@/hooks/useReferees";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, UserPlus, Trash2, Users, Crown } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function AdminRoles() {
  const { data: userRoles, isLoading } = useUserRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("referee");

  const createUserWithRole = useMutation({
    mutationFn: async ({ email, password, role }: { email: string; password: string; role: AppRole }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-with-role`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ email, password, role }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create user");
      return data;
    },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["user-roles"] }); toast({ title: "User Created", description: `Successfully created user with ${data.role} role.` }); setIsDialogOpen(false); setEmail(""); setPassword(""); setSelectedRole("referee"); },
    onError: (error: Error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); },
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => { const { error } = await supabase.from("user_roles").delete().eq("id", roleId); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["user-roles"] }); toast({ title: "Role Removed" }); },
    onError: (error: Error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" }); return; }
    if (password.length < 6) { toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" }); return; }
    createUserWithRole.mutate({ email, password, role: selectedRole });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-xs gap-1"><Crown className="h-3 w-3" />Admin</Badge>;
      case "referee": return <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Referee</Badge>;
      case "tho_admin": return <Badge className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">THO Admin</Badge>;
      default: return <Badge variant="secondary" className="text-xs">{role}</Badge>;
    }
  };

  const stats = { total: userRoles?.length ?? 0, admins: userRoles?.filter(r => r.role === "admin").length ?? 0, referees: userRoles?.filter(r => r.role === "referee").length ?? 0 };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Shield}
          title="User Roles"
          description="Create users and manage access permissions"
          badge={<Badge variant="secondary" className="font-mono text-xs">{stats.total}</Badge>}
          actions={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><UserPlus className="h-4 w-4" /> Add User</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Create a new user account and assign a role.</DialogDescription></DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Role</Label>
                      <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as AppRole)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="referee">Referee</SelectItem><SelectItem value="admin">Super Admin</SelectItem><SelectItem value="tho_admin">THO Admin</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select>
                    </div>
                  </div>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createUserWithRole.isPending}>{createUserWithRole.isPending ? "Creating..." : "Create User"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="grid grid-cols-3 gap-4">
          <AdminStatCard label="Total Roles" value={stats.total} icon={Users} />
          <AdminStatCard label="Admins" value={stats.admins} icon={Crown} accentColor="text-destructive" />
          <AdminStatCard label="Referees" value={stats.referees} icon={Shield} accentColor="text-primary" />
        </div>

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-sm">Loading...</p></div>
            ) : userRoles?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Users className="h-10 w-10 mb-3 opacity-30" /><p className="text-sm">No user roles found.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">User ID</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Role</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70">Created</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles?.map((role) => (
                    <TableRow key={role.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{role.user_id.substring(0, 8)}...</TableCell>
                      <TableCell>{getRoleBadge(role.role)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(role.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteRole.mutate(role.id)} disabled={deleteRole.isPending}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
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
