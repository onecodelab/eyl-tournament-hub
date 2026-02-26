import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTournaments, useTeams, usePlayers, useAllMatches, useNews } from "@/hooks/useSupabaseData";
import { Trophy, Users, UserCircle, Calendar, Newspaper, TrendingUp, Zap, BarChart3, LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
  const { data: tournaments } = useTournaments();
  const { data: teams } = useTeams();
  const { data: players } = usePlayers();
  const { data: matches } = useAllMatches();
  const { data: news } = useNews();

  const upcomingMatches = matches?.filter(m => m.status === "scheduled").slice(0, 5) ?? [];
  const recentNews = news?.slice(0, 5) ?? [];

  const liveCount = matches?.filter(m => m.status === "live").length ?? 0;
  const completedCount = matches?.filter(m => m.status === "completed").length ?? 0;
  const activeTournaments = tournaments?.filter(t => t.status === "ongoing").length ?? 0;
  const featuredArticles = news?.filter(n => n.is_featured).length ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={LayoutDashboard}
          title="Dashboard"
          description="Overview of the Ethiopian Youth League"
          badge={liveCount > 0 ? (
            <Badge className="bg-eyl-live/10 text-eyl-live border-eyl-live/30 gap-1.5 animate-pulse">
              <Zap className="h-3 w-3" />
              {liveCount} Live
            </Badge>
          ) : undefined}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AdminStatCard label="Tournaments" value={tournaments?.length ?? 0} icon={Trophy} accentColor="text-eyl-gold" />
          <AdminStatCard label="Teams" value={teams?.length ?? 0} icon={Users} accentColor="text-blue-400" />
          <AdminStatCard label="Players" value={players?.length ?? 0} icon={UserCircle} accentColor="text-emerald-400" />
          <AdminStatCard label="Matches" value={matches?.length ?? 0} icon={Calendar} accentColor="text-violet-400" />
          <AdminStatCard label="News" value={news?.length ?? 0} icon={Newspaper} accentColor="text-amber-400" />
        </div>

        {/* Activity Feed */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Calendar className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No upcoming matches</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                      <span className="text-sm font-medium truncate">{match.venue || "TBD"}</span>
                      <span className="text-xs text-muted-foreground font-mono shrink-0 ml-4">
                        {match.match_date ? new Date(match.match_date).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                  <Newspaper className="h-3.5 w-3.5 text-primary" />
                </div>
                Recent News
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Newspaper className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No news articles</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {recentNews.map((article) => (
                    <div key={article.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                      <span className="text-sm font-medium truncate flex-1 mr-3">{article.title}</span>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Draft"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
              </div>
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Completed Matches", value: completedCount, color: "text-emerald-400" },
                { label: "Live Now", value: liveCount, color: "text-eyl-live" },
                { label: "Active Tournaments", value: activeTournaments, color: "text-blue-400" },
                { label: "Featured Articles", value: featuredArticles, color: "text-violet-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/30">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
