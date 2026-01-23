import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Calendar, 
  Newspaper,
  Video,
  LogOut,
  Menu,
  ShieldX,
  Trophy,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EYLLogo } from "@/components/EYLLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const thoNavItems = [
  { title: "Dashboard", url: "/tho-admin", icon: LayoutDashboard },
  { title: "Teams", url: "/tho-admin/teams", icon: Users },
  { title: "Players", url: "/tho-admin/players", icon: UserCircle },
  { title: "Matches", url: "/tho-admin/matches", icon: Calendar },
  { title: "News", url: "/tho-admin/news", icon: Newspaper },
  { title: "Videos", url: "/tho-admin/videos", icon: Video },
];

interface THOAdminLayoutProps {
  children: ReactNode;
  selectedTournamentId?: string;
  onTournamentChange?: (tournamentId: string) => void;
}

function THOSidebarContent({ 
  selectedTournamentId, 
  onTournamentChange 
}: { 
  selectedTournamentId?: string; 
  onTournamentChange?: (tournamentId: string) => void;
}) {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { assignedTournaments } = useTournamentAdmin();

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <div className="p-4 flex flex-col items-center border-b border-border/50 gap-3">
        <Link to="/tho-admin" className="flex items-center gap-2">
          <EYLLogo size={collapsed ? 32 : 40} />
          {!collapsed && <span className="font-bold text-lg">THO Admin</span>}
        </Link>
        
        {!collapsed && assignedTournaments.length > 0 && onTournamentChange && (
          <Select value={selectedTournamentId} onValueChange={onTournamentChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent>
              {assignedTournaments.map((tournament: any) => (
                <SelectItem key={tournament.id} value={tournament.id}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3" />
                    {tournament.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {thoNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function THOAdminLayout({ children, selectedTournamentId, onTournamentChange }: THOAdminLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const { isTHOAdmin, isSuperAdmin, isLoading: isRoleLoading } = useUserRole();
  const { assignedTournaments, isLoading: isTournamentLoading } = useTournamentAdmin();
  const navigate = useNavigate();
  const [localTournamentId, setLocalTournamentId] = useState<string | undefined>(selectedTournamentId);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Set default tournament when tournaments load
  useEffect(() => {
    if (!localTournamentId && assignedTournaments.length > 0) {
      const defaultId = (assignedTournaments[0] as any).id;
      setLocalTournamentId(defaultId);
      onTournamentChange?.(defaultId);
    }
  }, [assignedTournaments, localTournamentId, onTournamentChange]);

  const handleTournamentChange = (tournamentId: string) => {
    setLocalTournamentId(tournamentId);
    onTournamentChange?.(tournamentId);
  };

  if (loading || isRoleLoading || isTournamentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <EYLLogo size={60} withGlow />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Super admins should use the admin panel instead
  if (isSuperAdmin) {
    navigate("/admin");
    return null;
  }

  // Show access denied for non-THO admin users
  if (!isTHOAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <ShieldX className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the Tournament Host Organization admin panel.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no tournaments assigned
  if (assignedTournaments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <Trophy className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">No Tournaments Assigned</h1>
          <p className="text-muted-foreground max-w-md">
            You haven't been assigned to manage any tournaments yet. Please contact the super admin to get access.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <THOSidebarContent 
          selectedTournamentId={localTournamentId} 
          onTournamentChange={handleTournamentChange} 
        />
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Tournament Host Organization Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <ChangePasswordDialog
                trigger={
                  <Button variant="ghost" size="icon" title="Change Password">
                    <Key className="h-4 w-4" />
                  </Button>
                }
              />
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
