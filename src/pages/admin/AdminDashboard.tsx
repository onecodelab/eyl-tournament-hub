import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTournaments, useTeams, usePlayers, useAllMatches, useNews } from "@/hooks/useSupabaseData";
import { Trophy, Users, UserCircle, Calendar, Newspaper, TrendingUp } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";

export default function AdminDashboard() {
  const { data: tournaments } = useTournaments();
  const { data: teams } = useTeams();
  const { data: players } = usePlayers();
  const { data: matches } = useAllMatches();
  const { data: news } = useNews();

  const stats = [
    { title: "Tournaments", value: tournaments?.length ?? 0, icon: Trophy, color: "text-yellow-500" },
    { title: "Teams", value: teams?.length ?? 0, icon: Users, color: "text-blue-500" },
    { title: "Players", value: players?.length ?? 0, icon: UserCircle, color: "text-green-500" },
    { title: "Matches", value: matches?.length ?? 0, icon: Calendar, color: "text-purple-500" },
    { title: "News Articles", value: news?.length ?? 0, icon: Newspaper, color: "text-orange-500" },
  ];

  const upcomingMatches = matches?.filter(m => m.status === "scheduled").slice(0, 5) ?? [];
  const recentNews = news?.slice(0, 5) ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <EYLLogo size={50} withGlow />
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to EYL Admin Panel</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Matches
              </CardTitle>
              <CardDescription>Next scheduled matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingMatches.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming matches</p>
              ) : (
                upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium truncate">{match.venue || "TBD"}</span>
                    <span className="text-xs text-muted-foreground">
                      {match.match_date ? new Date(match.match_date).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Recent News
              </CardTitle>
              <CardDescription>Latest published articles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No news articles</p>
              ) : (
                recentNews.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium truncate flex-1 mr-2">{article.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Draft"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-500">
                  {matches?.filter(m => m.status === "completed").length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Completed Matches</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-yellow-500">
                  {matches?.filter(m => m.status === "live").length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Live Now</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-500">
                  {tournaments?.filter(t => t.status === "ongoing").length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Active Tournaments</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-purple-500">
                  {news?.filter(n => n.is_featured).length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Featured Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
