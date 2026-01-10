import { useState } from "react";
import { THOAdminLayout } from "@/components/admin/THOAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EYLLogo } from "@/components/EYLLogo";
import { useTeams, useMatches, usePlayers, useNews, useVideos } from "@/hooks/useSupabaseData";
import { useTournamentAdmin } from "@/hooks/useTournamentAdmin";
import { Users, UserCircle, Calendar, Newspaper, Video, Trophy } from "lucide-react";

export default function THODashboard() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>();
  const { assignedTournaments } = useTournamentAdmin();
  
  const { data: allTeams = [] } = useTeams();
  const { data: allPlayers = [] } = usePlayers();
  const { data: allMatches = [] } = useMatches();
  const { data: allNews = [] } = useNews();
  const { data: allVideos = [] } = useVideos();

  // Filter data by selected tournament
  const teams = allTeams.filter((t: any) => t.tournament_id === selectedTournamentId);
  const players = allPlayers.filter((p: any) => 
    teams.some((t: any) => t.id === p.team_id)
  );
  const matches = allMatches.filter((m: any) => m.tournament_id === selectedTournamentId);
  const news = allNews.filter((n: any) => n.tournament_id === selectedTournamentId);
  const videos = allVideos.filter((v: any) => v.tournament_id === selectedTournamentId);

  const selectedTournament = assignedTournaments.find(
    (t: any) => t.id === selectedTournamentId
  );

  const stats = [
    { title: "Teams", count: teams.length, icon: Users, color: "text-blue-500" },
    { title: "Players", count: players.length, icon: UserCircle, color: "text-green-500" },
    { title: "Matches", count: matches.length, icon: Calendar, color: "text-amber-500" },
    { title: "News Articles", count: news.length, icon: Newspaper, color: "text-purple-500" },
    { title: "Videos", count: videos.length, icon: Video, color: "text-red-500" },
  ];

  return (
    <THOAdminLayout 
      selectedTournamentId={selectedTournamentId}
      onTournamentChange={setSelectedTournamentId}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <EYLLogo size={48} withGlow />
          <div>
            <h1 className="text-2xl font-bold">THO Admin Dashboard</h1>
            {selectedTournament && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>Managing: {(selectedTournament as any).name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Matches */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matches.filter((m: any) => m.status === "scheduled").length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming matches</p>
              ) : (
                <div className="space-y-3">
                  {matches
                    .filter((m: any) => m.status === "scheduled")
                    .slice(0, 5)
                    .map((match: any) => (
                      <div key={match.id} className="flex items-center justify-between text-sm">
                        <span>{match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}</span>
                        <span className="text-muted-foreground">
                          {match.match_date ? new Date(match.match_date).toLocaleDateString() : "TBD"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent News */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Recent News
              </CardTitle>
            </CardHeader>
            <CardContent>
              {news.length === 0 ? (
                <p className="text-muted-foreground text-sm">No news articles</p>
              ) : (
                <div className="space-y-3">
                  {news.slice(0, 5).map((article: any) => (
                    <div key={article.id} className="text-sm">
                      <p className="font-medium line-clamp-1">{article.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(article.published_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </THOAdminLayout>
  );
}
