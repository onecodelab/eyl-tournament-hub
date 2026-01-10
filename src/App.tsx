import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Community from "./pages/Community";
import Matches from "./pages/Matches";
import Standings from "./pages/Standings";
import News from "./pages/News";
import Statistics from "./pages/Statistics";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";
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
import THODashboard from "./pages/tho-admin/THODashboard";
import THOTeams from "./pages/tho-admin/THOTeams";
import THOPlayers from "./pages/tho-admin/THOPlayers";
import THOMatches from "./pages/tho-admin/THOMatches";
import THONews from "./pages/tho-admin/THONews";
import THOVideos from "./pages/tho-admin/THOVideos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/community" element={<Community />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/clubs/:id" element={<ClubDetail />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
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
            <Route path="/tho-admin" element={<THODashboard />} />
            <Route path="/tho-admin/teams" element={<THOTeams />} />
            <Route path="/tho-admin/players" element={<THOPlayers />} />
            <Route path="/tho-admin/matches" element={<THOMatches />} />
            <Route path="/tho-admin/news" element={<THONews />} />
            <Route path="/tho-admin/videos" element={<THOVideos />} />
            <Route path="/referee" element={<RefereeDashboard />} />
            <Route path="/referee/match/:id" element={<LiveMatch />} />
            <Route path="/referee/match/:id/report" element={<MatchReport />} />
            <Route path="*" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
