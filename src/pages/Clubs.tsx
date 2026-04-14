import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useTeams } from "@/hooks/useSupabaseData";
import { Trophy, Users, MapPin, Calendar, TrendingUp, Target, ChevronRight } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Clubs() {
  const { data: teams, isLoading } = useTeams();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.short_name && team.short_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.stadium && team.stadium.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teams, searchQuery]);

  const sortedTeams = useMemo(() => 
    [...filteredTeams].sort((a, b) => (b.points || 0) - (a.points || 0)),
    [filteredTeams]
  );

  return (
    <Layout>
      {/* Header — Elite Academy Directory */}
      <section className="relative py-12 overflow-hidden bg-eyl-navy border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4 mb-2">
            <EYLLogo size={60} withGlow />
            <div>
              <div className="data-precision-mono text-primary font-bold tracking-widest mb-1">ACADEMY DIRECTORY</div>
              <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Clubs</h1>
            </div>
          </div>
        </div>
      </section>
      
      {/* Global Search */}
      <section className="container mx-auto px-4 mb-8 mt-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search clubs by name or stadium..." 
            className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl text-white placeholder:text-white/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-black text-primary data-precision italic">{teams?.length || 0}</div>
            <div className="data-precision-mono text-white/30 tracking-widest mt-1">TOTAL CLUBS</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-black text-white data-precision italic">
              {teams?.reduce((sum, t) => sum + (t.goals_for || 0), 0) || 0}
            </div>
            <div className="data-precision-mono text-white/30 tracking-widest mt-1">TOTAL GOALS</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-black text-white data-precision italic">
              {teams?.reduce((sum, t) => sum + (t.wins || 0) + (t.draws || 0) + (t.losses || 0), 0) || 0}
            </div>
            <div className="data-precision-mono text-white/30 tracking-widest mt-1">MATCHES PLAYED</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-black text-green-400 data-precision italic">
              {sortedTeams[0]?.short_name || sortedTeams[0]?.name?.slice(0, 3) || '-'}
            </div>
            <div className="data-precision-mono text-white/30 tracking-widest mt-1">LEAGUE LEADER</div>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="eyl-card p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-12 bg-white/10 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTeams.map((team, index) => {
              const played = (team.wins || 0) + (team.draws || 0) + (team.losses || 0);
              const goalDiff = (team.goals_for || 0) - (team.goals_against || 0);
              
              return (
                <Link 
                  to={`/clubs/${team.id}`}
                  key={team.id} 
                  className="eyl-card p-6 hover:border-primary/50 transition-all duration-300 group block"
                >
                  {/* Team Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30 group-hover:border-primary/60 transition-colors">
                        {team.logo_url ? (
                          <img 
                            src={team.logo_url} 
                            alt={team.name} 
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-xl font-bold text-primary">
                            {team.short_name || team.name?.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      {/* Rank Badge with EYL Logo */}
                      <div className="absolute -top-2 -right-2">
                        <div className="relative">
                          <EYLLogo size={24} />
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white mt-1">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">
                          {team.name}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      {team.coach && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {team.coach}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-lg font-bold text-green-400">{team.wins || 0}</div>
                      <div className="text-xs text-muted-foreground">W</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-lg font-bold text-yellow-400">{team.draws || 0}</div>
                      <div className="text-xs text-muted-foreground">D</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-lg font-bold text-red-400">{team.losses || 0}</div>
                      <div className="text-xs text-muted-foreground">L</div>
                    </div>
                  </div>

                  {/* Points & Goals */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Points</span>
                    </div>
                    <span className="text-xl font-bold text-primary">{team.points || 0}</span>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">GF</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{team.goals_for || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">GA</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{team.goals_against || 0}</span>
                    </div>
                  </div>

                  {/* Goal Difference */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Goal Diff</span>
                    </div>
                    <span className={`text-sm font-bold ${goalDiff > 0 ? 'text-green-400' : goalDiff < 0 ? 'text-red-400' : 'text-white'}`}>
                      {goalDiff > 0 ? '+' : ''}{goalDiff}
                    </span>
                  </div>

                  {/* Footer Info */}
                  {(team.stadium || team.founded_year) && (
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-1">
                      {team.stadium && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {team.stadium}
                        </p>
                      )}
                      {team.founded_year && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          Est. {team.founded_year}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && sortedTeams.length === 0 && (
          <div className="text-center py-16">
            <EYLLogo size={80} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Clubs Found</h3>
            <p className="text-muted-foreground">Check back soon for team updates.</p>
          </div>
        )}
      </section>
    </Layout>
  );
}
