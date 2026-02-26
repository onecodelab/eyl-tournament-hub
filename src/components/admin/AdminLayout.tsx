import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  UserCircle, 
  Calendar, 
  Newspaper,
  Video,
  Handshake,
  LogOut,
  Menu,
  Shield,
  ShieldX,
  Key,
  FileText,
  Database,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EYLLogo } from "@/components/EYLLogo";
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

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Data Center", url: "/admin/data-center", icon: Database },
  { title: "Tournaments", url: "/admin/tournaments", icon: Trophy },
  { title: "Teams", url: "/admin/teams", icon: Users },
  { title: "Players", url: "/admin/players", icon: UserCircle },
  { title: "Matches", url: "/admin/matches", icon: Calendar },
  { title: "Match Reports", url: "/admin/match-reports", icon: FileText },
  { title: "News", url: "/admin/news", icon: Newspaper },
  { title: "Videos", url: "/admin/videos", icon: Video },
  { title: "Sponsors", url: "/admin/sponsors", icon: Handshake },
  { title: "User Roles", url: "/admin/roles", icon: Shield },
];

function AdminSidebarContent() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <div className="p-4 flex items-center justify-center border-b border-border/50">
        <Link to="/admin" className="flex items-center gap-3">
          <EYLLogo size={collapsed ? 28 : 36} />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">EYL Admin</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Control Panel</span>
            </div>
          )}
        </Link>
      </div>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 px-4">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && (
                          <>
                            <span className="text-sm font-medium flex-1">{item.title}</span>
                            {isActive && <ChevronRight className="h-3 w-3 text-primary/60" />}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || isRoleLoading) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <ShieldX className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the admin panel. This area is restricted to administrators only.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger>
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Ethiopian Youth League</span>
                <span className="text-border">•</span>
                <span>Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline px-3 py-1.5 rounded-full bg-muted/50 font-mono">
                {user.email}
              </span>
              <ChangePasswordDialog
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Change Password">
                    <Key className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 h-8 text-xs">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
