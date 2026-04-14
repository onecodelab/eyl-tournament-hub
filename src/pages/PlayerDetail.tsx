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
      {/* Hero Section - LALIGA "Star Journey" Style */}
      <section className="relative min-h-[500px] flex items-end pb-12 overflow-hidden bg-eyl-navy">
        {/* Large Action Photography Background Effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-eyl-navy via-eyl-navy/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-eyl-navy via-transparent to-eyl-navy z-10" />
          {player.photo_url ? (
            <img 
              src={player.photo_url} 
              alt="" 
              className="w-full h-full object-cover object-top opacity-30 grayscale blur-[2px]"
            />
          ) : (
            <div className="w-full h-full bg-primary/5" />
          )}
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="flex flex-col lg:flex-row items-end gap-8 lg:gap-16">
            
            {/* Main Player Cutout/Photo */}
            <div className="relative group shrink-0">
              <div className="relative w-64 h-[380px] md:w-80 md:h-[480px] overflow-hidden rounded-t-3xl border-x-2 border-t-2 border-primary/30 bg-gradient-to-b from-primary/20 to-transparent">
                {player.photo_url ? (
                  <img 
                    src={player.photo_url} 
                    alt={player.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl font-black text-primary/20">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                
                {/* Number Overlay - Bundesliga style */}
                {player.jersey_number && (
                  <div className="absolute top-4 left-4">
                    <span className="text-7xl md:text-8xl font-black text-white/10 italic select-none">
                      {player.jersey_number}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Position Tag overlay */}
              <div className="absolute bottom-6 -right-4">
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl border border-white/20 backdrop-blur-md ${getPositionBadgeColor(player.position)}`}>
                  {player.position}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <span className="data-precision-mono text-primary font-bold">ETHIOPIAN YOUTH LEAGUE</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="data-precision-mono text-white/50">{team?.name || 'Independent'}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white italic uppercase tracking-tighter mb-8 leading-[0.9]">
                {player.name.split(' ').map((part, i) => (
                  <span key={i} className={i === 1 ? "text-primary block" : "block"}>{part}</span>
                ))}
              </h1>

              {/* LALIGA "Key Stats" Overlays */}
              <div className="flex flex-wrap gap-4 md:gap-8 mb-10">
                <div className="glass-card p-4 min-w-[120px] border-primary/30">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Goals</p>
                  <p className="text-4xl font-black data-precision italic">{player.goals || 0}</p>
                </div>
                <div className="glass-card p-4 min-w-[120px] border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Assists</p>
                  <p className="text-4xl font-black data-precision italic">{player.assists || 0}</p>
                </div>
                <div className="glass-card p-4 min-w-[120px] border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Apps</p>
                  <p className="text-4xl font-black data-precision italic">{player.appearances || 0}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setShowBioModal(true)}
                  className="bg-eyl-gradient text-white font-black hover:opacity-90 px-8 h-12 rounded-full shadow-[0_0_20px_hsl(187,100%,50%,0.4)] transition-all scale-100 active:scale-95"
                >
                  FULL SCOUTING REPORT
                </Button>
                
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <social.icon className="h-5 w-5 text-white" />
                  </a>
                ))}
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