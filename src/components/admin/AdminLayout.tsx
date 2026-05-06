import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  UserCircle, 
  Calendar, 
  Newspaper,
  Video,
  Handshake,
  Database,
  ChevronRight,
  Menu,
  FileText,
  LogOut,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EYLLogo } from "@/components/EYLLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/contexts/AuthContext";
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
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  // Defense-in-depth: Secondary auth check at layout level
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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
            <div className="flex items-center gap-3">
              <LanguageToggle />
              {user && (
                <span className="hidden md:block text-xs text-muted-foreground truncate max-w-[200px]">
                  {user.email}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={async () => { await signOut(); navigate("/login"); }}
              >
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
