import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useTeams, usePlayers, useAllMatches } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, Users, MapPin, Calendar, ExternalLink, 
  ChevronRight, Globe, Instagram, Facebook, Twitter
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useEffect } from "react";

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: players, isLoading: playersLoading } = usePlayers({ teamId: id });
  const { data: matches, isLoading: matchesLoading } = useAllMatches();

  const team = useMemo(() => teams?.find(t => t.id === id), [teams, id]);

  const allTeamMatches = useMemo(() => {
    if (!matches || !id) return [];
    return matches
      .filter(m => m.home_team_id === id || m.away_team_id === id)
      .sort((a, b) => new Date(a.match_date || "").getTime() - new Date(b.match_date || "").getTime());
  }, [matches, id]);

  const teamMatches = useMemo(() => {
    return allTeamMatches.slice(0, 5);
  }, [allTeamMatches]);

  const teamsMap = useMemo(() => {
    if (!teams) return new Map();
    return new Map(teams.map(t => [t.id, t]));
  }, [teams]);

  // Calculate form (last 5 matches)
  const recentForm = useMemo(() => {
    if (!matches || !id) return [];
    const completedMatches = matches
      .filter(m => 
        (m.home_team_id === id || m.away_team_id === id) && 
        m.status === 'completed'
      )
      .slice(0, 5);

    return completedMatches.map(match => {
      const isHome = match.home_team_id === id;
      const teamScore = isHome ? match.home_score : match.away_score;
      const opponentScore = isHome ? match.away_score : match.home_score;
      const opponentId = isHome ? match.away_team_id : match.home_team_id;
      
      let result: 'W' | 'D' | 'L' = 'D';
      if ((teamScore || 0) > (opponentScore || 0)) result = 'W';
      else if ((teamScore || 0) < (opponentScore || 0)) result = 'L';
      
      return { 
        result, 
        score: `${teamScore || 0}-${opponentScore || 0}`,
        opponent: teamsMap.get(opponentId || ""),
        isHome
      };
    });
  }, [matches, id, teamsMap]);

  const getResultColor = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
    }
  };

  const getPositionBadgeColor = (position: string | null) => {
    switch (position?.toLowerCase()) {
      case "goalkeeper": return "bg-yellow-500/20 text-yellow-400";
      case "defender": return "bg-blue-500/20 text-blue-400";
      case "midfielder": return "bg-green-500/20 text-green-400";
      case "forward": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Get top performers
  const topScorer = useMemo(() => 
    players?.reduce((prev, curr) => 
      (curr.goals || 0) > (prev?.goals || 0) ? curr : prev
    , players[0]), [players]);

  const topAssister = useMemo(() => 
    players?.reduce((prev, curr) => 
      (curr.assists || 0) > (prev?.assists || 0) ? curr : prev
    , players[0]), [players]);

  // League position
  const leaguePosition = useMemo(() => {
    if (!teams || !team) return 0;
    const sorted = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
    return sorted.findIndex(t => t.id === team.id) + 1;
  }, [teams, team]);

  useEffect(() => {
    if (team) {
      document.title = `${team.name} | EYL Club Profile & Schedule`;
    }
  }, [team]);

  if (teamsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Club Not Found</h1>
          <Link to="/clubs">
            <Button variant="outline">Back to Clubs</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const socialLinks = [
    { icon: Globe, url: (team as any).website_url, label: "Website" },
    { icon: Instagram, url: (team as any).social_instagram, label: "Instagram" },
    { icon: Twitter, url: (team as any).social_twitter, label: "X/Twitter" },
    { icon: Facebook, url: (team as any).social_facebook, label: "Facebook" },
  ].filter(s => s.url);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/30 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.2),transparent_50%)]" />
        
        <div className="container mx-auto px-4 py-8 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/clubs" className="hover:text-foreground transition-colors">Clubs</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{team.name}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Club Badge & Info */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                  ) : (
                    <span className="text-4xl md:text-5xl font-bold text-primary">
                      {team.short_name || team.name?.slice(0, 3)}
                    </span>
                  )}
                </div>
                {/* Position Badge */}
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-primary flex items-center justify-center border-4 border-background">
                  <span className="text-lg font-bold text-primary-foreground">{leaguePosition}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                {team.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                {team.founded_year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Est. {team.founded_year}
                  </span>
                )}
                {team.stadium && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {team.stadium}
                  </span>
                )}
              </div>

              {team.coach && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-muted-foreground">Manager:</span>
                  <span className="text-foreground font-semibold">{team.coach}</span>
                </div>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all text-sm"
                    >
                      <social.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{social.label}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="w-full md:w-auto flex md:flex-col gap-3">
              <div className="flex-1 md:flex-none p-4 rounded-xl bg-card/50 border border-border/50 text-center min-w-[100px]">
                <div className="text-3xl font-bold text-primary">{team.points || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Points</div>
              </div>
              <div className="flex-1 md:flex-none p-4 rounded-xl bg-card/50 border border-border/50 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-foreground">{(team.wins || 0) + (team.draws || 0) + (team.losses || 0)}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Played</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Form */}
          <div className="space-y-6">
            {/* Season Stats */}
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Season Stats
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-400">{team.wins || 0}</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                  <div className="text-2xl font-bold text-yellow-400">{team.draws || 0}</div>
                  <div className="text-xs text-muted-foreground">Draws</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10">
                  <div className="text-2xl font-bold text-red-400">{team.losses || 0}</div>
                  <div className="text-xs text-muted-foreground">Losses</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Goals For</span>
                  <span className="font-semibold text-foreground">{team.goals_for || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Goals Against</span>
                  <span className="font-semibold text-foreground">{team.goals_against || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Goal Difference</span>
                  <span className={`font-semibold ${((team.goals_for || 0) - (team.goals_against || 0)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(team.goals_for || 0) - (team.goals_against || 0) >= 0 ? '+' : ''}{(team.goals_for || 0) - (team.goals_against || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Form */}
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Team Form</h3>
              
              {recentForm.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {recentForm.map((match, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-lg ${getResultColor(match.result)} flex items-center justify-center text-white font-bold`}
                        title={`${match.isHome ? 'H' : 'A'}: ${match.score} vs ${match.opponent?.short_name || match.opponent?.name}`}
                      >
                        {match.result}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 mt-4">
                    {recentForm.map((match, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={`w-6 h-6 rounded ${getResultColor(match.result)} text-white text-xs flex items-center justify-center font-medium`}>
                          {match.result}
                        </span>
                        <span className="text-muted-foreground">{match.isHome ? 'H' : 'A'}</span>
                        <span className="flex-1 truncate text-foreground">{match.opponent?.name || 'Unknown'}</span>
                        <span className="font-medium text-foreground">{match.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent matches</p>
              )}
            </div>

            {/* Top Performers */}
            {(topScorer || topAssister) && (
              <div className="rounded-xl bg-card border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Performers</h3>
                
                <div className="space-y-4">
                  {topScorer && (topScorer.goals || 0) > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group">
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={topScorer.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {topScorer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{topScorer.name}</p>
                        <p className="text-xs text-muted-foreground">Top Scorer</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{topScorer.goals}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                      </div>
                    </div>
                  )}
                  
                  {topAssister && (topAssister.assists || 0) > 0 && topAssister.id !== topScorer?.id && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group">
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={topAssister.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {topAssister.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{topAssister.name}</p>
                        <p className="text-xs text-muted-foreground">Top Assists</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{topAssister.assists}</p>
                        <p className="text-xs text-muted-foreground">Assists</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Schedule */}
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Full Schedule
                </h3>
              </div>
              
              {allTeamMatches.length > 0 ? (
                <div className="space-y-3">
                  {allTeamMatches.map((match, i) => {
                    const isCompleted = match.status === 'completed';
                    const isHome = match.home_team_id === id;
                    const opponentId = isHome ? match.away_team_id : match.home_team_id;
                    const opponent = teamsMap.get(opponentId || "");
                    
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            {match.match_date ? format(new Date(match.match_date), 'EEE, MMM d') : 'TBD'}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-muted-foreground">{isHome ? 'Home' : 'Away'} vs</span>
                            <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">{opponent?.name || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded text-xs font-bold ${isCompleted ? 'bg-secondary text-foreground' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                            {isCompleted ? `${match.home_score}-${match.away_score}` : match.match_date ? format(new Date(match.match_date), 'HH:mm') : 'TBD'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No matches scheduled yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Squad */}
          <div className="lg:col-span-2 space-y-6">
            {/* Squad */}
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Squad
                </h3>
                <span className="text-sm text-muted-foreground">{players?.length || 0} players</span>
              </div>

              {playersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : players && players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 group"
                    >
                      <Avatar className="h-11 w-11 border border-border/50">
                        <AvatarImage src={player.photo_url || undefined} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {player.jersey_number && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {player.jersey_number}
                            </span>
                          )}
                          <p className="font-medium text-foreground truncate">
                            {player.name}
                          </p>
                        </div>
                        {player.position && (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPositionBadgeColor(player.position)}`}>
                            {player.position}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No players found</p>
              )}
            </div>

            {/* League Table Position */}
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Table</h3>
                <Link to="/standings" className="text-sm text-primary hover:underline flex items-center gap-1">
                  See all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="text-4xl font-bold text-primary">{leaguePosition}<sup className="text-lg">{getOrdinalSuffix(leaguePosition)}</sup></div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Current Position</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {team.points} points from {(team.wins || 0) + (team.draws || 0) + (team.losses || 0)} matches
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}