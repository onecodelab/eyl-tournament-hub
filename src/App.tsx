import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Matches from "./pages/Matches";
import Standings from "./pages/Standings";
import News from "./pages/News";
import Statistics from "./pages/Statistics";
import Clubs from "./pages/Clubs";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminPlayers from "./pages/admin/AdminPlayers";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminNews from "./pages/admin/AdminNews";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminRoles from "./pages/admin/AdminRoles";
import RefereeDashboard from "./pages/referee/RefereeDashboard";
import LiveMatch from "./pages/referee/LiveMatch";
import MatchReport from "./pages/referee/MatchReport";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tournaments" element={<AdminTournaments />} />
            <Route path="/admin/teams" element={<AdminTeams />} />
            <Route path="/admin/players" element={<AdminPlayers />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/videos" element={<AdminVideos />} />
            <Route path="/admin/sponsors" element={<AdminSponsors />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/referee" element={<RefereeDashboard />} />
            <Route path="/referee/match/:id" element={<LiveMatch />} />
            <Route path="/referee/match/:id/report" element={<MatchReport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
