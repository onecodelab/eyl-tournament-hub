import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRolesWithEmail } from "@/hooks/useReferees";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Mail, UserCog } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function AdminRoles() {
  const { data: userRoles, isLoading, refetch } = useUserRolesWithEmail();
  const { toast } = useToast();
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "tho_admin" | "referee" | "user">("tho_admin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: newUserId, role: newRole });

      if (error) throw error;

      toast({ title: "Success", description: "Role assigned successfully" });
      setNewUserId("");
      refetch();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to assign role. Make sure the User ID is valid and not already assigned this role.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Role removed successfully" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>;
      case "tho_admin":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">THO Admin</Badge>;
      case "referee":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Referee</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={Shield}
          title="User Roles"
          description="Manage administrative and staff permissions"
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Role Form */}
          <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-primary" />
                Assign New Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-3 w-3 text-primary" />
                  How to add new users
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  New users must first create an account on the <strong>Sign Up</strong> page. 
                  Once they register, they can provide you with their <strong>User ID (UUID)</strong> 
                  from their profile, which you can then enter below to assign them a role.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-8 text-[10px] gap-2 mt-1 border-primary/20 hover:bg-primary/5"
                  onClick={() => {
                    const url = window.location.origin + "/signup";
                    navigator.clipboard.writeText(url);
                    toast({ title: "Link Copied", description: "Sign up link copied to clipboard" });
                  }}
                >
                  Copy Sign Up Link
                </Button>
              </div>

              <form onSubmit={handleAddRole} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground/70">
                    User ID (UUID)
                  </Label>
                  <Input
                    id="userId"
                    placeholder="Enter user UUID"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="bg-background/50 border-white/10 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground/70">
                    Role
                  </Label>
                  <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="tho_admin">THO Admin</SelectItem>
                      <SelectItem value="referee">Referee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full gap-2 mt-2" disabled={isSubmitting || !newUserId}>
                  {isSubmitting ? "Assigning..." : "Assign Role"}
                  <UserCog className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Existing Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading roles...</div>
              ) : userRoles?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic">No administrative roles assigned yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">User / ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Role</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/70 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {userRoles?.map((role) => (
                        <tr key={role.id} className="group hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                {role.email}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                {role.user_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRoleBadge(role.role)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => handleRemoveRole(role.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
