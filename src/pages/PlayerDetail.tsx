import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { usePlayers, useTeams, useAllMatches } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ChevronRight, Instagram, Twitter, Calendar, 
  Ruler, Footprints, Hash, Clock
} from "lucide-react";
import { format } from "date-fns";

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: matches } = useAllMatches();
  
  const [showBioModal, setShowBioModal] = useState(false);

  const player = useMemo(() => players?.find(p => p.id === id), [players, id]);
  const team = useMemo(() => {
    if (!teams || !player?.team_id) return null;
    return teams.find(t => t.id === player.team_id);
  }, [teams, player]);

  const teammates = useMemo(() => {
    if (!players || !player?.team_id) return [];
    return players
      .filter(p => p.team_id === player.team_id && p.id !== player.id)
      .slice(0, 9);
  }, [players, player]);

  const teamsMap = useMemo(() => {
    if (!teams) return new Map();
    return new Map(teams.map(t => [t.id, t]));
  }, [teams]);

  // Team form (last 5 matches)
  const teamForm = useMemo(() => {
    if (!matches || !player?.team_id) return [];
    const teamId = player.team_id;
    
    return matches
      .filter(m => 
        (m.home_team_id === teamId || m.away_team_id === teamId) && 
        m.status === 'completed'
      )
      .slice(0, 5)
      .map(match => {
        const isHome = match.home_team_id === teamId;
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
          isHome,
          date: match.match_date
        };
      });
  }, [matches, player, teamsMap]);

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

  // Extended player data (with new fields from migration)
  const extendedPlayer = player as typeof player & {
    date_of_birth?: string;
    nationality?: string;
    height?: number;
    preferred_foot?: string;
    joined_date?: string;
    bio?: string;
    social_instagram?: string;
    social_twitter?: string;
  };

  const formatHeight = (cm: number | undefined) => {
    if (!cm) return null;
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${cm}cm / ${feet}'${inches}"`;
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (player) {
      document.title = `${player.name} | EYL Player Profile`;
    }
  }, [player]);

  if (playersLoading || teamsLoading) {
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

  if (!player) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Player Not Found</h1>
          <Link to="/players">
            <Button variant="outline">Back to Players</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const socialLinks = [
    { icon: Instagram, url: extendedPlayer.social_instagram, label: "Instagram" },
    { icon: Twitter, url: extendedPlayer.social_twitter, label: "X/Twitter" },
  ].filter(s => s.url);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.2),transparent_50%)]" />
        
        <div className="container mx-auto px-4 py-8 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/players" className="hover:text-foreground transition-colors">Players</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{player.name}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Player Photo */}
            <div className="flex-shrink-0">
              <div className="relative w-44 h-52 md:w-52 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30">
                {player.photo_url ? (
                  <img 
                    src={player.photo_url} 
                    alt={player.name} 
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary/50">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                
                {/* Jersey Number Badge */}
                {player.jersey_number && (
                  <div className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{player.jersey_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  {player.name}
                </h1>
                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="flex gap-2">
                    {socialLinks.map((social, i) => (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card flex items-center justify-center transition-all"
                      >
                        <social.icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Club & Position */}
              <div className="flex items-center gap-3 mb-6">
                {team && (
                  <Link 
                    to={`/clubs/${team.id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {team.logo_url && (
                      <img src={team.logo_url} alt={team.name} className="h-5 w-5 object-contain" />
                    )}
                    <span className="text-muted-foreground">{team.name}</span>
                  </Link>
                )}
                {player.position && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPositionBadgeColor(player.position)}`}>
                      {player.jersey_number && `${player.jersey_number} `}{player.position}
                    </span>
                  </>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {extendedPlayer.nationality && (
                  <div className="p-3 rounded-xl bg-card/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Nationality</p>
                    <p className="font-semibold text-foreground">{extendedPlayer.nationality}</p>
                  </div>
                )}
                {extendedPlayer.preferred_foot && (
                  <div className="p-3 rounded-xl bg-card/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Preferred Foot</p>
                    <p className="font-semibold text-foreground">{extendedPlayer.preferred_foot}</p>
                  </div>
                )}
                {extendedPlayer.date_of_birth && (
                  <div className="p-3 rounded-xl bg-card/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(extendedPlayer.date_of_birth), 'dd/MM/yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {/* Performance Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Appearances</p>
                  <p className="text-3xl font-bold text-foreground">{player.appearances || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Goals</p>
                  <p className="text-3xl font-bold text-foreground">{player.goals || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Assists</p>
                  <p className="text-3xl font-bold text-foreground">{player.assists || 0}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Stats calculated from official match reports
              </p>

              {/* Full Bio Button */}
              <Button 
                onClick={() => setShowBioModal(true)}
                className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
              >
                Full Bio
              </Button>
            </div>

            {/* Team Form */}
            <div className="w-full md:w-auto">
              <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">Team Form</h3>
                  {team && (
                    <div className="flex items-center gap-1.5">
                      {team.logo_url && (
                        <img src={team.logo_url} alt="" className="h-4 w-4 object-contain" />
                      )}
                      <span className="text-xs text-muted-foreground">{team.short_name || team.name}</span>
                    </div>
                  )}
                </div>
                
                {teamForm.length > 0 ? (
                  <div className="space-y-2">
                    {teamForm.map((match, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">
                          {match.date ? format(new Date(match.date), 'MMM d') : '—'}
                        </span>
                        {match.opponent?.logo_url ? (
                          <img src={match.opponent.logo_url} alt="" className="h-5 w-5 object-contain" />
                        ) : (
                          <div className="h-5 w-5 rounded bg-muted flex items-center justify-center text-[8px]">
                            {match.opponent?.short_name?.slice(0, 2) || '?'}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground flex-1">
                          {match.opponent?.short_name || match.opponent?.name || 'Unknown'} ({match.isHome ? 'H' : 'A'})
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getResultColor(match.result)}`}>
                          {match.score}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent matches</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Teammates */}
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Teammates</h3>
            {team && (
              <Link to={`/clubs/${team.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {teammates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teammates.map((teammate) => (
                <Link
                  key={teammate.id}
                  to={`/players/${teammate.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
                >
                  <Avatar className="h-10 w-10 border border-border/50 group-hover:border-primary/50">
                    <AvatarImage src={teammate.photo_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {teammate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate text-sm">
                      {teammate.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teammate.jersey_number && `${teammate.jersey_number} `}{teammate.position || 'Player'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No teammates found</p>
          )}
        </div>
      </section>

      {/* Full Bio Modal */}
      <Dialog open={showBioModal} onOpenChange={setShowBioModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Full Bio</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            {extendedPlayer.date_of_birth && (
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </div>
                <p className="font-semibold text-foreground">
                  {format(new Date(extendedPlayer.date_of_birth), 'dd/MM/yyyy')}
                </p>
              </div>
            )}
            
            {player.position && (
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Position</p>
                <p className="font-semibold text-foreground">{player.position}</p>
              </div>
            )}

            {extendedPlayer.nationality && (
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Nationality</p>
                <p className="font-semibold text-foreground">{extendedPlayer.nationality}</p>
              </div>
            )}

            {extendedPlayer.height && (
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Ruler className="h-4 w-4" />
                  Height
                </div>
                <p className="font-semibold text-foreground">{formatHeight(extendedPlayer.height)}</p>
              </div>
            )}

            {extendedPlayer.preferred_foot && (
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Footprints className="h-4 w-4" />
                  Preferred Foot
                </div>
                <p className="font-semibold text-foreground">{extendedPlayer.preferred_foot}</p>
              </div>
            )}

            {player.jersey_number && (
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Hash className="h-4 w-4" />
                  Shirt Number
                </div>
                <p className="font-semibold text-foreground">{player.jersey_number}</p>
              </div>
            )}

            {extendedPlayer.joined_date && (
              <div className="p-4 rounded-lg bg-muted/30 col-span-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  Joined Club
                </div>
                <p className="font-semibold text-foreground">
                  {format(new Date(extendedPlayer.joined_date), 'MMMM yyyy')}
                </p>
              </div>
            )}
          </div>

          {extendedPlayer.bio && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{extendedPlayer.bio}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}