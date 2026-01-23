import { useNavigate } from "react-router-dom";
import { format, isToday, isFuture, isPast, parseISO } from "date-fns";
import { Calendar, MapPin, Clock, Play, Eye, Shield, Key } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRefereeMatches } from "@/hooks/useRefereeMatches";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserRole } from "@/hooks/useReferees";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

type MatchWithTeams = {
  id: string;
  match_date: string | null;
  venue: string | null;
  status: string | null;
  home_score: number | null;
  away_score: number | null;
  home_team: { id: string; name: string; short_name: string | null; logo_url: string | null } | null;
  away_team: { id: string; name: string; short_name: string | null; logo_url: string | null } | null;
  tournament: { id: string; name: string } | null;
};

export default function RefereeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: roles } = useCurrentUserRole();
  const { data: matches = [], isLoading } = useRefereeMatches();

  const isReferee = roles?.includes("referee") || roles?.includes("admin");

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to access the referee dashboard.</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  if (!isReferee) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have referee permissions.</p>
        </div>
      </Layout>
    );
  }

  const categorizeMatches = (matches: MatchWithTeams[]) => {
    const today: MatchWithTeams[] = [];
    const upcoming: MatchWithTeams[] = [];
    const completed: MatchWithTeams[] = [];

    matches.forEach((match) => {
      if (match.status === "completed") {
        completed.push(match);
      } else if (match.match_date) {
        const matchDate = parseISO(match.match_date);
        if (isToday(matchDate)) {
          today.push(match);
        } else if (isFuture(matchDate)) {
          upcoming.push(match);
        } else if (isPast(matchDate)) {
          // Past but not completed - treat as today for action
          today.push(match);
        }
      } else {
        upcoming.push(match);
      }
    });

    return { today, upcoming, completed };
  };

  const { today, upcoming, completed } = categorizeMatches(matches as MatchWithTeams[]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "ready":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Ready</Badge>;
      case "in_progress":
        return <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status || "Scheduled"}</Badge>;
    }
  };

  const MatchCard = ({ match }: { match: MatchWithTeams }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            {match.tournament?.name || "League Match"}
          </span>
          {getStatusBadge(match.status)}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            {match.home_team?.logo_url && (
              <img src={match.home_team.logo_url} alt="" className="h-8 w-8 object-contain" />
            )}
            <span className="font-semibold text-sm truncate">
              {match.home_team?.short_name || match.home_team?.name || "Home"}
            </span>
          </div>

          <div className="px-4 text-center">
            {match.status === "completed" || match.status === "in_progress" ? (
              <span className="text-xl font-bold">
                {match.home_score ?? 0} - {match.away_score ?? 0}
              </span>
            ) : (
              <span className="text-lg font-medium text-muted-foreground">vs</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-semibold text-sm truncate text-right">
              {match.away_team?.short_name || match.away_team?.name || "Away"}
            </span>
            {match.away_team?.logo_url && (
              <img src={match.away_team.logo_url} alt="" className="h-8 w-8 object-contain" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {match.match_date && (
            <>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(parseISO(match.match_date), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(parseISO(match.match_date), "HH:mm")}
              </div>
            </>
          )}
          {match.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {match.venue}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/referee/match/${match.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Match
          </Button>
          {match.status !== "completed" && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/referee/match/${match.id}`)}
            >
              <Play className="h-4 w-4 mr-1" />
              {match.status === "in_progress" ? "Continue" : "Start"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const MatchSection = ({ title, matches, emptyMessage }: { title: string; matches: MatchWithTeams[]; emptyMessage: string }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {title}
        <Badge variant="secondary" className="text-xs">{matches.length}</Badge>
      </h2>
      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Referee Dashboard</h1>
            <p className="text-muted-foreground">Manage your assigned matches</p>
          </div>
          <ChangePasswordDialog
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Key className="h-4 w-4" />
                Change Password
              </Button>
            }
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <MatchSection
              title="Today's Matches"
              matches={today}
              emptyMessage="No matches scheduled for today"
            />
            <MatchSection
              title="Upcoming Matches"
              matches={upcoming}
              emptyMessage="No upcoming matches assigned"
            />
            <MatchSection
              title="Completed Matches"
              matches={completed}
              emptyMessage="No completed matches yet"
            />
          </>
        )}
      </div>
    </Layout>
  );
}
