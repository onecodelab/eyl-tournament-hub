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
    <Layout>
      {/* Hero Section - The Elite Path Style */}
      <section className="relative min-h-[400px] flex items-end pb-12 overflow-hidden bg-eyl-navy">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-eyl-navy via-eyl-navy/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.15),transparent_70%)] z-10" />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="flex flex-col md:flex-row items-end gap-8 lg:gap-12">
            {/* Club Badge */}
            <div className="relative shrink-0">
              <div className="w-40 h-40 md:w-52 md:h-52 glass-card flex items-center justify-center p-8 border-primary/30 shadow-[0_0_30px_hsl(187,100%,50%,0.1)]">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                ) : (
                  <span className="text-6xl font-black text-primary/50 italic">
                    {team.short_name || team.name?.slice(0, 3)}
                  </span>
                )}
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-eyl-gradient flex items-center justify-center border-4 border-eyl-navy shadow-lg">
                <span className="text-2xl font-black text-white italic">{leaguePosition}</span>
              </div>
            </div>

            {/* Club Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="data-precision-mono text-primary font-bold tracking-widest uppercase text-xs">OFFICIAL ACADEMY RANKING</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="data-precision-mono text-white/50 uppercase text-xs">EST. {team.founded_year || '2025'}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-6 leading-[0.9]">
                {team.name}
              </h1>

              <div className="flex flex-wrap gap-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Manager</span>
                  <span className="text-xl font-bold text-white uppercase italic">{team.coach || 'Head Scout'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Base</span>
                  <span className="text-xl font-bold text-white uppercase italic">{team.stadium || 'Addis Ababa'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Squad</span>
                  <span className="text-xl font-bold text-white italic data-precision">{players?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Tactical CTA */}
            <div className="w-full md:w-auto pb-2">
              <Button className="w-full md:w-auto bg-white/5 text-white border border-white/20 hover:bg-white/10 px-8 h-14 rounded-full font-black uppercase tracking-widest text-xs transition-all">
                CLUB MANIFESTO
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Tactical Stats - span-4 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 border-primary/20">
              <h3 className="data-precision-mono text-primary font-bold mb-6 tracking-widest flex items-center justify-between">
                TACTICAL ENERGY
                <Trophy className="h-4 w-4" />
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                  <div className="text-2xl font-black text-green-400 data-precision italic">{team.wins || 0}</div>
                  <div className="text-[9px] uppercase font-bold text-white/30 tracking-tighter">Victories</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-center">
                  <div className="text-2xl font-black text-yellow-400 data-precision italic">{team.draws || 0}</div>
                  <div className="text-[9px] uppercase font-bold text-white/30 tracking-tighter">Draws</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                  <div className="text-2xl font-black text-red-400 data-precision italic">{team.losses || 0}</div>
                  <div className="text-[9px] uppercase font-bold text-white/30 tracking-tighter">Defeats</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs uppercase font-bold text-white/40 tracking-wider">Net Rating (GD)</span>
                  <span className={`text-xl font-black data-precision ${((team.goals_for || 0) - (team.goals_against || 0)) >= 0 ? 'text-primary' : 'text-red-400'}`}>
                    {(team.goals_for || 0) - (team.goals_against || 0) >= 0 ? '+' : ''}{(team.goals_for || 0) - (team.goals_against || 0)}
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_10px_hsl(187,100%,50%,0.5)]" 
                    style={{ width: `${Math.min(100, Math.max(0, (team.points || 0) / 30 * 100))}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Modern Form Visualizer */}
            <div className="glass-card p-6 border-white/5">
              <h3 className="data-precision-mono text-white/50 font-bold mb-6 tracking-widest">ELITE PATH FORM</h3>
              <div className="flex gap-2">
                {recentForm.map((match, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-12 rounded-lg ${getResultColor(match.result)} flex items-center justify-center text-white font-black italic transform transition-transform hover:scale-105 cursor-help`}
                    title={`${match.isHome ? 'H' : 'A'} ${match.score} vs ${match.opponent?.name}`}
                  >
                    {match.result}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Overlays */}
            {(topScorer || topAssister) && (
              <div className="glass-card p-6 border-white/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Users className="h-24 w-24" />
                </div>
                <h3 className="data-precision-mono text-white/50 font-bold mb-6 tracking-widest relative z-10">CORE ASSETS</h3>
                <div className="space-y-4 relative z-10">
                  {topScorer && (topScorer.goals || 0) > 0 && (
                    <Link to={`/players/${topScorer.id}`} className="flex items-center gap-4 group">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-primary/30 group-hover:border-primary transition-all">
                          <AvatarImage src={topScorer.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black">
                            {topScorer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white italic uppercase group-hover:text-primary transition-colors">{topScorer.name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Lethal Finisher</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary data-precision italic">{topScorer.goals}</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Squad + Schedule + Table - span-8 */}
          <div className="lg:col-span-8 space-y-8">
            {/* Schedule - Premium Timeline */}
            <div className="glass-card p-6 border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="data-precision-mono text-primary font-bold tracking-widest flex items-center gap-3">
                  <Calendar className="h-4 w-4" />
                  FIXTURE TIMELINE
                </h3>
              </div>
              
              {allTeamMatches.length > 0 ? (
                <div className="space-y-2">
                  {allTeamMatches.map((match, i) => {
                    const isCompleted = match.status === 'completed';
                    const isLive = match.status === 'live';
                    const isHome = match.home_team_id === id;
                    const opponentId = isHome ? match.away_team_id : match.home_team_id;
                    const opponent = teamsMap.get(opponentId || "");
                    
                    return (
                      <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/5 ${isLive ? 'live-card-pulse border-primary/30' : 'border-white/5'}`}>
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <span className="data-precision-mono text-[10px] text-white/30 font-bold block">
                              {match.match_date ? format(new Date(match.match_date), 'MMM d') : 'TBD'}
                            </span>
                            <span className="data-precision-mono text-[10px] text-white/20">
                              {match.match_date ? format(new Date(match.match_date), 'EEE') : ''}
                            </span>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div>
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{isHome ? 'HOME' : 'AWAY'}</span>
                            <p className="text-sm font-black text-white italic uppercase">{opponent?.name || 'Unknown'}</p>
                          </div>
                        </div>
                        <div>
                          {isLive && (
                            <span className="live-badge text-[10px]">LIVE</span>
                          )}
                          {isCompleted && (
                            <span className="text-lg font-black data-precision italic text-white">{match.home_score}-{match.away_score}</span>
                          )}
                          {!isLive && !isCompleted && (
                            <span className="data-precision-mono text-primary font-bold text-sm">
                              {match.match_date ? format(new Date(match.match_date), 'HH:mm') : 'TBD'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-white/30 text-center py-8">No fixtures scheduled yet</p>
              )}
            </div>

            {/* Squad - Premium Grid */}
            <div className="glass-card p-6 border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="data-precision-mono text-primary font-bold tracking-widest flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  FIRST TEAM SQUAD
                </h3>
                <span className="data-precision-mono text-white/30 text-xs">{players?.length || 0} REGISTERED</span>
              </div>

              {playersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : players && players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {players.map((player) => (
                    <Link
                      key={player.id}
                      to={`/players/${player.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/30 transition-all group"
                    >
                      <Avatar className="h-12 w-12 border-2 border-white/10 group-hover:border-primary/30 transition-all">
                        <AvatarImage src={player.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {player.jersey_number && (
                            <span className="text-xs font-black text-white/20 data-precision italic">
                              {player.jersey_number}
                            </span>
                          )}
                          <p className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
                            {player.name}
                          </p>
                        </div>
                        {player.position && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${getPositionBadgeColor(player.position)}`}>
                            {player.position}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary/50 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-white/30">No players registered</p>
              )}
            </div>

            {/* League Standing */}
            <div className="glass-card p-6 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="data-precision-mono text-primary font-bold tracking-widest">LEAGUE STANDING</h3>
                <Link to="/standings" className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1">
                  FULL TABLE <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="text-center">
                  <span className="text-6xl font-black text-primary data-precision italic">{leaguePosition}</span>
                  <span className="text-lg font-black text-primary/50 align-top">{getOrdinalSuffix(leaguePosition)}</span>
                </div>
                <div className="w-px h-16 bg-primary/20" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white/50 uppercase">Current Position</p>
                  <p className="text-white/30 text-xs mt-1 data-precision-mono">
                    {team.points} PTS // {(team.wins || 0) + (team.draws || 0) + (team.losses || 0)} MATCHES PLAYED
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