import { Layout } from "@/components/layout/Layout";
import { useTopScorers, useTopAssisters, useTopAppearances } from "@/hooks/usePlayerStats";
import { useTeams } from "@/hooks/useSupabaseData";
import { Trophy, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import { EYLLogo } from "@/components/EYLLogo";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const tabs = ["Dashboard", "Player", "Club", "All-time Stats", "Records"];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { data: topScorers = [], isLoading: scorersLoading } = useTopScorers(10);
  const { data: topAssisters = [], isLoading: assistersLoading } = useTopAssisters(10);
  const { data: topAppearances = [], isLoading: appearancesLoading } = useTopAppearances(10);
  const { data: teams = [] } = useTeams();

  const isLoading = scorersLoading || assistersLoading || appearancesLoading;
  const hasNoData = topScorers.length === 0 && topAssisters.length === 0 && topAppearances.length === 0;

  return (
    <Layout>
      {/* Header — Elite Stats Centre */}
      <div className="relative py-12 bg-eyl-navy border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4">
            <EYLLogo size={60} withGlow />
            <div>
              <div className="data-precision-mono text-primary font-bold tracking-widest mb-1">PERFORMANCE INTELLIGENCE</div>
              <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                Stats <span className="text-primary">Centre</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <Alert className="mb-6 border-primary/30 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription>
            All statistics are automatically calculated from official match reports submitted by referees. 
            Stats update when matches are completed through the referee workflow.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
        ) : hasNoData ? (
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Statistics Available Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Statistics will appear here once matches are completed through the referee workflow. 
              Goals, assists, and appearances are calculated from official match reports.
            </p>
          </div>
        ) : (
          <>
            {/* Player Stats Section */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <EYLLogo size={32} />
                <h2 className="text-xl font-bold">
                  EYL 2025/26 <span className="text-primary">Player Stats</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Goals */}
                <LeaderboardCard 
                  title="Top Scorers" 
                  data={topScorers.map(p => ({
                    id: p.id,
                    name: p.name,
                    team: p.team?.name || "Unknown",
                    teamLogo: p.team?.logo_url,
                    shortName: p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
                    value: p.goals,
                    photoUrl: p.photo_url,
                  }))}
                  valueLabel="goals"
                />
                
                {/* Assists */}
                <LeaderboardCard 
                  title="Top Assisters" 
                  data={topAssisters.map(p => ({
                    id: p.id,
                    name: p.name,
                    team: p.team?.name || "Unknown",
                    teamLogo: p.team?.logo_url,
                    shortName: p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
                    value: p.assists,
                    photoUrl: p.photo_url,
                  }))}
                  valueLabel="assists"
                  valueColor="cyan"
                />
                
                {/* Appearances */}
                <LeaderboardCard 
                  title="Most Appearances" 
                  data={topAppearances.map(p => ({
                    id: p.id,
                    name: p.name,
                    team: p.team?.name || "Unknown",
                    teamLogo: p.team?.logo_url,
                    shortName: p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
                    value: p.appearances,
                    photoUrl: p.photo_url,
                  }))}
                  valueLabel="apps"
                />
              </div>
            </div>

            {/* Club Stats Section */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <EYLLogo size={32} />
                <h2 className="text-xl font-bold">
                  EYL 2025/26 <span className="text-primary">Team Standings</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Goals Scored */}
                <TeamLeaderboardCard 
                  title="Goals Scored" 
                  data={teams
                    .filter(t => (t.goals_for || 0) > 0)
                    .sort((a, b) => (b.goals_for || 0) - (a.goals_for || 0))
                    .slice(0, 10)
                    .map(t => ({
                      name: t.name,
                      shortName: t.short_name || t.name.slice(0, 2).toUpperCase(),
                      logoUrl: t.logo_url,
                      value: t.goals_for || 0,
                    }))}
                />
                
                {/* Most Wins */}
                <TeamLeaderboardCard 
                  title="Most Wins" 
                  data={teams
                    .filter(t => (t.wins || 0) > 0)
                    .sort((a, b) => (b.wins || 0) - (a.wins || 0))
                    .slice(0, 10)
                    .map(t => ({
                      name: t.name,
                      shortName: t.short_name || t.name.slice(0, 2).toUpperCase(),
                      logoUrl: t.logo_url,
                      value: t.wins || 0,
                    }))}
                />
                
                {/* Points */}
                <TeamLeaderboardCard 
                  title="Total Points" 
                  data={teams
                    .filter(t => (t.points || 0) > 0)
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .slice(0, 10)
                    .map(t => ({
                      name: t.name,
                      shortName: t.short_name || t.name.slice(0, 2).toUpperCase(),
                      logoUrl: t.logo_url,
                      value: t.points || 0,
                    }))}
                />
              </div>
            </div>
          </>
        )}

        {/* Notice Banner */}
        <div className="glass-card p-4 border-l-4 border-l-primary">
          <p className="text-sm text-muted-foreground">
            Statistics are calculated from match reports submitted by referees. 
            Only completed matches with proper lineups and events are counted.
          </p>
        </div>
      </div>
    </Layout>
  );
}

interface LeaderboardCardProps {
  title: string;
  data: Array<{
    id: string;
    name: string;
    team: string;
    teamLogo?: string | null;
    shortName: string;
    value: number;
    photoUrl?: string | null;
  }>;
  valueLabel: string;
  valueColor?: "gold" | "cyan";
}

function LeaderboardCard({ title, data, valueLabel, valueColor = "gold" }: LeaderboardCardProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {data.map((player, index) => (
          <div 
            key={player.id}
            className="flex items-center gap-2 py-1 rounded-lg px-1 -mx-1"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              index === 0 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground"
            }`}>
              {index + 1}
            </span>
            {player.photoUrl ? (
              <img 
                src={player.photoUrl} 
                alt={player.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                index === 0 
                  ? "bg-primary/20 text-primary" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                {player.shortName}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{player.name}</p>
              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                {player.teamLogo && (
                  <img src={player.teamLogo} alt="" className="w-3 h-3 object-contain" />
                )}
                {player.team}
              </p>
            </div>
            <span className={`text-sm font-bold data-precision ${
              valueColor === "cyan" ? "text-cyan-400" : "text-primary"
            }`}>
              {player.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TeamLeaderboardCardProps {
  title: string;
  data: Array<{
    name: string;
    shortName: string;
    logoUrl?: string | null;
    value: number;
  }>;
}

function TeamLeaderboardCard({ title, data }: TeamLeaderboardCardProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        {data.map((team, index) => (
          <div 
            key={team.name + index}
            className="flex items-center gap-2 py-1"
          >
            <span className={`w-5 text-xs font-bold ${
              index === 0 ? "text-primary" : "text-muted-foreground"
            }`}>
              {index + 1}
            </span>
            {team.logoUrl ? (
              <img 
                src={team.logoUrl} 
                alt={team.name}
                className="w-7 h-7 object-contain"
              />
            ) : (
              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                index === 0 
                  ? "bg-primary/20 text-primary" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                {team.shortName}
              </div>
            )}
            <span className="flex-1 text-sm truncate uppercase tracking-tight">{team.name}</span>
            <span className="text-sm font-bold text-primary data-precision">
              {team.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
