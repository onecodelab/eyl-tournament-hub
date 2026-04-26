import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Calendar, 
  Newspaper,
  Video,
  Menu,
  Trophy,
  FileText,
  Handshake,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EYLLogo } from "@/components/EYLLogo";
import { useAuth } from "@/contexts/AuthContext";
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
  { title: "Match Reports", url: "/tho-admin/match-reports", icon: FileText },
  { title: "News", url: "/tho-admin/news", icon: Newspaper },
  { title: "Videos", url: "/tho-admin/videos", icon: Video },
  { title: "Sponsors", url: "/tho-admin/sponsors", icon: Handshake },
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
  const { assignedTournaments, isLoading: isTournamentLoading } = useTournamentAdmin();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [localTournamentId, setLocalTournamentId] = useState<string | undefined>(
    () => selectedTournamentId || sessionStorage.getItem('tho_selected_tournament') || undefined
  );

  // Set default tournament when tournaments load or restore from session
  useEffect(() => {
    if (assignedTournaments.length > 0) {
      if (!localTournamentId) {
        const defaultId = (assignedTournaments[0] as any).id;
        setLocalTournamentId(defaultId);
        sessionStorage.setItem('tho_selected_tournament', defaultId);
        onTournamentChange?.(defaultId);
      } else if (localTournamentId !== selectedTournamentId) {
        // Hydrate parent state with our restored local state
        onTournamentChange?.(localTournamentId);
      }
    }
  }, [assignedTournaments, localTournamentId, selectedTournamentId, onTournamentChange]);

  const handleTournamentChange = (tournamentId: string) => {
    setLocalTournamentId(tournamentId);
    sessionStorage.setItem('tho_selected_tournament', tournamentId);
    onTournamentChange?.(tournamentId);
  };

  if (isTournamentLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }  return (
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
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
