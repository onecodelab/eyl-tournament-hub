import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useTournaments, useTeams, useAllMatches, useNews, usePlayers } from "@/hooks/useSupabaseData";
import { EYLLogo } from "@/components/EYLLogo";
import { TournamentSponsorBanner } from "@/components/tournament/TournamentSponsorBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, BarChart3, Newspaper, MapPin, Users, Clock, ArrowLeft, ChevronRight, History } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KnockoutBracket } from "@/components/tournament/KnockoutBracket";
import { GroupStageView } from "@/components/tournament/GroupStageView";

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: tournaments = [], isLoading: tournamentsLoading } = useTournaments();
  const { data: allTeams = [], isLoading: teamsLoading } = useTeams();
  const { data: allMatches = [], isLoading: matchesLoading } = useAllMatches();
  const { data: allNews = [] } = useNews();
  const { data: allPlayers = [] } = usePlayers();
  const [activeTab, setActiveTab] = useState("overview");

  const tournament = tournaments.find(t => t.id === id);
  const teams = useMemo(() => allTeams.filter(t => t.tournament_id === id), [allTeams, id]);
  const matches = useMemo(() => allMatches.filter(m => m.tournament_id === id), [allMatches, id]);
  const news = useMemo(() => allNews.filter(n => n.tournament_id === id), [allNews, id]);
  const players = useMemo(() => allPlayers.filter(p => teams.some(t => t.id === p.team_id)), [allPlayers, teams]);

  const sortedTeams = useMemo(() => 
    [...teams].sort((a, b) => (b.points || 0) - (a.points || 0)),
    [teams]
  );

  const topScorers = useMemo(() => 
    [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0)).slice(0, 5),
    [players]
  );

  const topAssists = useMemo(() => 
    [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0)).slice(0, 5),
    [players]
  );

  const upcomingMatches = useMemo(() => 
    matches.filter(m => m.status === 'scheduled').slice(0, 5),
    [matches]
  );

  const completedMatches = useMemo(() => 
    matches.filter(m => m.status === 'completed').slice(0, 10),
    [matches]
  );

  const teamsMap = useMemo(() => new Map(allTeams.map(t => [t.id, t])), [allTeams]);

  if (tournamentsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-secondary rounded-lg" />
            <div className="h-64 bg-secondary rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <Link to="/standings" className="text-primary hover:underline">
            ← Back to Competitions
          </Link>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">LIVE</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">UPCOMING</Badge>;
      case 'completed':
        return <Badge className="bg-muted text-muted-foreground">COMPLETED</Badge>;
      default:
        return null;
    }
  };

  const renderStandingsOrBracket = () => {
    const format = tournament.format || 'league';
    
    if (format === 'knockout') {
      return <KnockoutBracket matches={matches} teams={teamsMap} />;
    }
    
    if (format === 'group_knockout') {
      const groupMatches = matches.filter(m => m.stage === 'group' || !m.stage);
      const knockoutMatches = matches.filter(m => m.stage && m.stage !== 'group');
      
      return (
        <div className="space-y-8">
          <GroupStageView 
            teams={teams} 
            matches={groupMatches} 
            teamsMap={teamsMap}
            teamsQualifyingPerGroup={tournament.teams_qualifying_per_group || 2}
          />
          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Knockout Stage
            </h3>
            <KnockoutBracket 
              matches={knockoutMatches}
              teams={teamsMap}
              groupTeams={teams}
              groupMatches={groupMatches}
              teamsQualifyingPerGroup={tournament.teams_qualifying_per_group || 2}
            />
          </div>
        </div>
      );
    }
    
    // League format - show table
    return (
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase">
              <th className="p-2 md:p-4 text-left">#</th>
                <th className="p-2 md:p-4 text-left">Team</th>
                <th className="p-2 md:p-4 text-center">P</th>
                <th className="p-2 md:p-4 text-center text-green-500">W</th>
                <th className="p-2 md:p-4 text-center">D</th>
                <th className="p-2 md:p-4 text-center text-red-500">L</th>
                <th className="p-2 md:p-4 text-center">GD</th>
                <th className="p-2 md:p-4 text-center text-primary font-bold">PTS</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const gd = (team.goals_for || 0) - (team.goals_against || 0);
                const played = (team.wins || 0) + (team.draws || 0) + (team.losses || 0);
                const isChampion = index === 0;

                return (
                  <tr 
                    key={team.id} 
                    className={`border-b border-border hover:bg-secondary/50 transition-colors ${
                      isChampion ? "border-l-2 border-l-yellow-500" : ""
                    }`}
                  >
                    <td className="p-2 md:p-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="font-bold text-xs md:text-sm">{index + 1}</span>
                        {index === 0 && <Trophy className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="p-2 md:p-4">
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] md:text-xs font-bold text-primary flex-shrink-0">
                          {team.short_name || team.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{team.name}</span>
                      </div>
                    </td>
                    <td className="p-2 md:p-4 text-center text-xs md:text-sm">{played}</td>
                    <td className="p-2 md:p-4 text-center text-green-500 font-medium text-xs md:text-sm">{team.wins || 0}</td>
                    <td className="p-2 md:p-4 text-center text-xs md:text-sm">{team.draws || 0}</td>
                    <td className="p-2 md:p-4 text-center text-red-500 font-medium text-xs md:text-sm">{team.losses || 0}</td>
                    <td className="p-2 md:p-4 text-center text-xs md:text-sm">
                      <span className={gd > 0 ? "text-green-500" : gd < 0 ? "text-red-500" : ""}>
                        {gd > 0 ? `+${gd}` : gd}
                      </span>
                    </td>
                    <td className="p-2 md:p-4 text-center">
                      <span className="text-sm md:text-lg font-bold text-primary">{team.points || 0}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-5 md:py-12 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-3 md:px-4 relative">
          <Link to="/standings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 md:mb-4 text-xs md:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Back to Competitions
          </Link>
          <div className="flex items-start gap-3 md:gap-4">
            {tournament.logo_url ? (
              <img src={tournament.logo_url} alt={tournament.name} className="w-10 h-10 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="flex-shrink-0">
                <EYLLogo size={40} withGlow />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                <h1 className="text-lg md:text-3xl font-bold leading-tight">{tournament.name}</h1>
                {getStatusBadge()}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 md:gap-4 text-[11px] md:text-sm text-muted-foreground">
                {tournament.age_category && (
                  <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 py-0 md:px-2.5 md:py-0.5">{tournament.age_category.toUpperCase()}</Badge>
                )}
                {tournament.format && (
                  <Badge variant="outline" className="capitalize text-[10px] md:text-xs px-1.5 py-0 md:px-2.5 md:py-0.5">{tournament.format.replace('_', ' + ')}</Badge>
                )}
                {tournament.start_date && tournament.end_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    {format(new Date(tournament.start_date), "MMM d")} - {format(new Date(tournament.end_date), "MMM d, yyyy")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  {teams.length} Teams
                </span>
              </div>
              {tournament.description && (
                <p className="text-muted-foreground mt-1.5 md:mt-2 text-xs md:text-sm line-clamp-2">{tournament.description}</p>
              )}
              {tournament.status === 'completed' && (
                <Link to={`/tournaments/${id}/history`}>
                  <Button variant="outline" size="sm" className="mt-2 md:mt-3 text-xs md:text-sm h-7 md:h-9">
                    <History className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    View Tournament Archive
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Sponsors Banner */}
      {id && <TournamentSponsorBanner tournamentId={id} />}

      <div className="container mx-auto px-3 md:px-4 py-3 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card p-1 mb-4 md:mb-8 w-full md:w-auto grid grid-cols-4 md:inline-flex h-9 md:h-10">
            <TabsTrigger value="overview" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="fixtures" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Fixtures & Results</span>
              <span className="sm:hidden">Fixtures</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Newspaper className="h-3.5 w-3.5 md:h-4 md:w-4" />
              News
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - Table/Bracket */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {tournament.format === 'knockout' ? 'Bracket' : 
                   tournament.format === 'group_knockout' ? 'Groups & Bracket' : 'Standings'}
                </h3>
                {renderStandingsOrBracket()}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Top Scorers */}
                <div className="glass-card p-4">
                  <h4 className="font-semibold mb-4 flex items-center justify-between">
                    <span>Top Scorers</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </h4>
                  <div className="space-y-3">
                    {topScorers.map((player, i) => (
                      <div key={player.id} className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{player.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {teamsMap.get(player.team_id || '')?.name}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">{player.goals || 0}</span>
                      </div>
                    ))}
                    {topScorers.length === 0 && (
                      <p className="text-sm text-muted-foreground">No stats yet</p>
                    )}
                  </div>
                </div>

                {/* Top Assists */}
                <div className="glass-card p-4">
                  <h4 className="font-semibold mb-4 flex items-center justify-between">
                    <span>Top Assists</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </h4>
                  <div className="space-y-3">
                    {topAssists.map((player, i) => (
                      <div key={player.id} className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{player.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {teamsMap.get(player.team_id || '')?.name}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-cyan-400">{player.assists || 0}</span>
                      </div>
                    ))}
                    {topAssists.length === 0 && (
                      <p className="text-sm text-muted-foreground">No stats yet</p>
                    )}
                  </div>
                </div>

                {/* Match Rules */}
                {tournament.match_duration_minutes && (
                  <div className="glass-card p-4">
                    <h4 className="font-semibold mb-4">Match Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{tournament.match_duration_minutes} mins</span>
                      </div>
                      {tournament.half_time_duration_minutes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Half-time</span>
                          <span>{tournament.half_time_duration_minutes} mins</span>
                        </div>
                      )}
                      {tournament.max_substitutions && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Subs</span>
                          <span>{tournament.max_substitutions}</span>
                        </div>
                      )}
                      {tournament.extra_time_duration_minutes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Extra Time</span>
                          <span>{tournament.extra_time_duration_minutes} mins</span>
                        </div>
                      )}
                      {tournament.penalty_shootout !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Penalties</span>
                          <span>{tournament.penalty_shootout ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Fixtures Tab */}
          <TabsContent value="fixtures">
            <div className="space-y-8">
              {/* Upcoming */}
              <div>
                <h3 className="text-lg font-bold mb-4">Upcoming Fixtures</h3>
                {upcomingMatches.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingMatches.map((match) => (
                      <div key={match.id} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">UPCOMING</Badge>
                          {match.match_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(match.match_date), "MMM d, HH:mm")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-center flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary mx-auto mb-1">
                              {teamsMap.get(match.home_team_id || '')?.short_name || 'HT'}
                            </div>
                            <p className="text-xs truncate">{teamsMap.get(match.home_team_id || '')?.name}</p>
                          </div>
                          <span className="text-lg font-bold text-primary">VS</span>
                          <div className="text-center flex-1">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold mx-auto mb-1">
                              {teamsMap.get(match.away_team_id || '')?.short_name || 'AT'}
                            </div>
                            <p className="text-xs truncate">{teamsMap.get(match.away_team_id || '')?.name}</p>
                          </div>
                        </div>
                        {match.venue && (
                          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.venue}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center text-muted-foreground">
                    No upcoming fixtures
                  </div>
                )}
              </div>

              {/* Results */}
              <div>
                <h3 className="text-lg font-bold mb-4">Results</h3>
                {completedMatches.length > 0 ? (
                  <div className="space-y-3">
                    {completedMatches.map((match) => (
                      <div key={match.id} className="glass-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {teamsMap.get(match.home_team_id || '')?.short_name || 'HT'}
                          </div>
                          <span className="font-medium text-sm">{teamsMap.get(match.home_team_id || '')?.name}</span>
                        </div>
                        <div className="text-center px-4">
                          <div className="text-xl font-bold">
                            {match.home_score ?? 0} - {match.away_score ?? 0}
                          </div>
                          {match.match_date && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(match.match_date), "MMM d")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-medium text-sm">{teamsMap.get(match.away_team_id || '')?.name}</span>
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {teamsMap.get(match.away_team_id || '')?.short_name || 'AT'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center text-muted-foreground">
                    No results yet
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Goals */}
              <div className="glass-card p-4">
                <h4 className="font-semibold text-sm mb-4">Top Scorers</h4>
                <div className="space-y-2">
                  {[...players].sort((a, b) => (b.goals || 0) - (a.goals || 0)).slice(0, 10).map((player, i) => (
                    <div key={player.id} className="flex items-center gap-2 py-1">
                      <span className={`w-5 text-xs font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{player.name}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{player.goals || 0}</span>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <p className="text-sm text-muted-foreground">No player data</p>
                  )}
                </div>
              </div>

              {/* Assists */}
              <div className="glass-card p-4">
                <h4 className="font-semibold text-sm mb-4">Top Assists</h4>
                <div className="space-y-2">
                  {[...players].sort((a, b) => (b.assists || 0) - (a.assists || 0)).slice(0, 10).map((player, i) => (
                    <div key={player.id} className="flex items-center gap-2 py-1">
                      <span className={`w-5 text-xs font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{player.name}</p>
                      </div>
                      <span className="text-sm font-bold text-cyan-400">{player.assists || 0}</span>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <p className="text-sm text-muted-foreground">No player data</p>
                  )}
                </div>
              </div>

              {/* Team Goals */}
              <div className="glass-card p-4">
                <h4 className="font-semibold text-sm mb-4">Team Goals</h4>
                <div className="space-y-2">
                  {[...teams].sort((a, b) => (b.goals_for || 0) - (a.goals_for || 0)).slice(0, 10).map((team, i) => (
                    <div key={team.id} className="flex items-center gap-2 py-1">
                      <span className={`w-5 text-xs font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{team.name}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{team.goals_for || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal Difference */}
              <div className="glass-card p-4">
                <h4 className="font-semibold text-sm mb-4">Best Defense</h4>
                <div className="space-y-2">
                  {[...teams].sort((a, b) => (a.goals_against || 0) - (b.goals_against || 0)).slice(0, 10).map((team, i) => (
                    <div key={team.id} className="flex items-center gap-2 py-1">
                      <span className={`w-5 text-xs font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{team.name}</p>
                      </div>
                      <span className="text-sm font-bold text-green-500">{team.goals_against || 0} GA</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            {news.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article) => (
                  <Link key={article.id} to={`/news/${article.id}`} className="glass-card overflow-hidden group">
                    {article.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      )}
                      {article.published_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(article.published_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No news articles for this tournament yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
