import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import Matches from "./pages/Matches";
import Standings from "./pages/Standings";
import News from "./pages/News";
import TournamentDetail from "./pages/TournamentDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminPlayers from "./pages/admin/AdminPlayers";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminNews from "./pages/admin/AdminNews";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminMatchReports from "./pages/admin/AdminMatchReports";
import AdminDataCenter from "./pages/admin/AdminDataCenter";
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
import THOMatchReports from "./pages/tho-admin/THOMatchReports";
import THOSponsors from "./pages/tho-admin/THOSponsors";
import TournamentHistory from "./pages/TournamentHistory";

/**
 * Security-hardened QueryClient configuration.
 * - Prevents excessive refetching (performance / DoS mitigation)
 * - Limits retry attempts to prevent infinite request loops
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — reduces unnecessary refetches
      retry: 2, // Limit retries to prevent infinite loops
      refetchOnWindowFocus: false, // Prevent refetch storms on tab switch
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* ══════════════════════════════════════════════════════════ */}
                  {/* PUBLIC ROUTES — No authentication required               */}
                  {/* ══════════════════════════════════════════════════════════ */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/standings" element={<Standings />} />
                  <Route path="/tournaments/:id" element={<TournamentDetail />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/tournaments/:id/history" element={<TournamentHistory />} />

                  {/* ══════════════════════════════════════════════════════════ */}
                  {/* ADMIN ROUTES — Requires "admin" role                     */}
                  {/* MobSF Fix: CWE-284, CWE-602 — Server-verified RBAC     */}
                  {/* ══════════════════════════════════════════════════════════ */}
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/tournaments" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminTournaments />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/teams" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminTeams />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/players" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPlayers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/matches" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminMatches />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/news" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminNews />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/videos" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminVideos />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/sponsors" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminSponsors />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/match-reports" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminMatchReports />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/data-center" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDataCenter />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/roles" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminRoles />
                    </ProtectedRoute>
                  } />

                  {/* ══════════════════════════════════════════════════════════ */}
                  {/* THO ADMIN ROUTES — Requires "admin" or "tho_admin" role  */}
                  {/* ══════════════════════════════════════════════════════════ */}
                  <Route path="/tho-admin" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THODashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/tho-admin/teams" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THOTeams />
                    </ProtectedRoute>
                  } />
                  <Route path="/tho-admin/players" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THOPlayers />
                    </ProtectedRoute>
                  } />
                  <Route path="/tho-admin/matches" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THOMatches />
                    </ProtectedRoute>
                  } />
                  <Route path="/tho-admin/news" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THONews />
                    </ProtectedRoute>
                  } />
                  <Route path="/tho-admin/videos" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THOVideos />
                    </ProtectedRoute>
                  } />
                  <Route path="/tho-admin/match-reports" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THOMatchReports />
                    </ProtectedRoute>
                  } />
                  <Route path="/tho-admin/sponsors" element={
                    <ProtectedRoute allowedRoles={["admin", "tho_admin"]}>
                      <THOSponsors />
                    </ProtectedRoute>
                  } />

                  {/* ══════════════════════════════════════════════════════════ */}
                  {/* REFEREE ROUTES — Requires "admin" or "referee" role       */}
                  {/* ══════════════════════════════════════════════════════════ */}
                  <Route path="/referee" element={
                    <ProtectedRoute allowedRoles={["admin", "referee"]}>
                      <RefereeDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/referee/match/:id" element={
                    <ProtectedRoute allowedRoles={["admin", "referee"]}>
                      <LiveMatch />
                    </ProtectedRoute>
                  } />
                  <Route path="/referee/match/:id/report" element={
                    <ProtectedRoute allowedRoles={["admin", "referee"]}>
                      <MatchReport />
                    </ProtectedRoute>
                  } />

                  {/* 404 Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
