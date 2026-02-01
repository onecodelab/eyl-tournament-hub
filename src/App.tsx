import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import About from "./pages/About";

import Matches from "./pages/Matches";
import Standings from "./pages/Standings";
import News from "./pages/News";
import TournamentDetail from "./pages/TournamentDetail";
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
import AdminMatchReports from "./pages/admin/AdminMatchReports";
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
import THOMatchReports from "./pages/tho-admin/THOMatchReports";
import TournamentHistory from "./pages/TournamentHistory";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
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
            
            <Route path="/matches" element={<Matches />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
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
            <Route path="/admin/match-reports" element={<AdminMatchReports />} />
            <Route path="/tho-admin" element={<THODashboard />} />
            <Route path="/tho-admin/teams" element={<THOTeams />} />
            <Route path="/tho-admin/players" element={<THOPlayers />} />
            <Route path="/tho-admin/matches" element={<THOMatches />} />
            <Route path="/tho-admin/news" element={<THONews />} />
            <Route path="/tho-admin/videos" element={<THOVideos />} />
            <Route path="/tho-admin/match-reports" element={<THOMatchReports />} />
            <Route path="/referee" element={<RefereeDashboard />} />
            <Route path="/referee/match/:id" element={<LiveMatch />} />
            <Route path="/referee/match/:id/report" element={<MatchReport />} />
            <Route path="/tournaments/:id/history" element={<TournamentHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
