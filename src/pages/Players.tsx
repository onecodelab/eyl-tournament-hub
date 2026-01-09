import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Filter, RotateCcw, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayers, useTeams } from "@/hooks/useSupabaseData";

const positions = ["All Positions", "Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function Players() {
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("All Positions");

  const teamsMap = useMemo(() => {
    if (!teams) return new Map();
    return new Map(teams.map(t => [t.id, t]));
  }, [teams]);

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === "all" || player.team_id === selectedTeam;
      const matchesPosition = selectedPosition === "All Positions" || 
        player.position?.toLowerCase() === selectedPosition.toLowerCase();
      
      return matchesSearch && matchesTeam && matchesPosition;
    });
  }, [players, searchQuery, selectedTeam, selectedPosition]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTeam("all");
    setSelectedPosition("All Positions");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getPositionBadgeColor = (position: string | null) => {
    switch (position?.toLowerCase()) {
      case "goalkeeper": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "defender": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "midfielder": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "forward": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const isLoading = playersLoading || teamsLoading;

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Squad</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Players
          </h1>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-[6.5rem] z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              
              {/* Team Filter */}
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[160px] bg-background/50 border-border/50">
                  <SelectValue placeholder="All Clubs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clubs</SelectItem>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        {team.logo_url && (
                          <img src={team.logo_url} alt="" className="h-4 w-4 object-contain" />
                        )}
                        <span className="truncate">{team.short_name || team.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Position Filter */}
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-[150px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Reset Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Players List */}
      <section className="container mx-auto px-4 py-6">
        {/* Column Headers */}
        <div className="hidden md:grid md:grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border/50">
          <div>Player</div>
          <div>Club</div>
          <div>Position</div>
          <div className="text-center">Stats</div>
          <div></div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border/30">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPlayers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Players Found</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {searchQuery || selectedTeam !== "all" || selectedPosition !== "All Positions"
                ? "Try adjusting your filters to find players."
                : "No players have been added to the database yet."}
            </p>
            {(searchQuery || selectedTeam !== "all" || selectedPosition !== "All Positions") && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Player Rows */}
        {!isLoading && filteredPlayers.length > 0 && (
          <div className="divide-y divide-border/30">
            {filteredPlayers.map((player, index) => {
              const team = teamsMap.get(player.team_id || "");
              
              return (
                <Link
                  to={`/players/${player.id}`}
                  key={player.id}
                  className="group grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-2 md:gap-4 items-center px-4 py-4 hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Player Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                      <AvatarImage src={player.photo_url || undefined} alt={player.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {player.name}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {player.jersey_number && (
                        <p className="text-xs text-muted-foreground">#{player.jersey_number}</p>
                      )}
                    </div>
                  </div>

                  {/* Club */}
                  <div className="flex items-center gap-2 md:pl-0 pl-15">
                    {team ? (
                      <>
                        {team.logo_url ? (
                          <img 
                            src={team.logo_url} 
                            alt={team.name} 
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {team.short_name?.slice(0, 2) || team.name.slice(0, 2)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                          {team.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Position */}
                  <div className="md:pl-0 pl-15">
                    {player.position ? (
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getPositionBadgeColor(player.position)}`}>
                        {player.position}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-4 md:pl-0 pl-15">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">{player.goals || 0}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Goals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">{player.assists || 0}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Assists</p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end md:pl-0 pl-15">
                    <span className="text-xs border border-border/50 hover:border-primary hover:text-primary transition-colors px-3 py-1.5 rounded-md">
                      View
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && filteredPlayers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground text-center">
              Showing <span className="font-medium text-foreground">{filteredPlayers.length}</span> player{filteredPlayers.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
}
