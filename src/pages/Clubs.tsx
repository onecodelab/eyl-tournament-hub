import { Layout } from "@/components/layout/Layout";
import { useTeams } from "@/hooks/useSupabaseData";
import { Trophy, Users, MapPin, Calendar, TrendingUp, Target } from "lucide-react";
import { EYLLogo } from "@/components/EYLLogo";

export default function Clubs() {
  const { data: teams, isLoading } = useTeams();

  const sortedTeams = teams?.sort((a, b) => (b.points || 0) - (a.points || 0)) || [];

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4 mb-2">
            <EYLLogo size={60} withGlow />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Clubs</h1>
              <p className="text-muted-foreground text-lg">
                All participating teams in the Ethiopian Youth League
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="eyl-card p-4 text-center">
            <div className="text-3xl font-bold text-primary">{teams?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Clubs</div>
          </div>
          <div className="eyl-card p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {teams?.reduce((sum, t) => sum + (t.goals_for || 0), 0) || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Goals</div>
          </div>
          <div className="eyl-card p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {teams?.reduce((sum, t) => sum + (t.wins || 0) + (t.draws || 0) + (t.losses || 0), 0) || 0}
            </div>
            <div className="text-sm text-muted-foreground">Matches Played</div>
          </div>
          <div className="eyl-card p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {sortedTeams[0]?.short_name || sortedTeams[0]?.name?.slice(0, 3) || '-'}
            </div>
            <div className="text-sm text-muted-foreground">League Leader</div>
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
                <div 
                  key={team.id} 
                  className="eyl-card p-6 hover:border-primary/50 transition-all duration-300 group"
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
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">
                        {team.name}
                      </h3>
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
                </div>
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
