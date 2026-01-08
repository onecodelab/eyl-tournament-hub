import { Layout } from "@/components/layout/Layout";
import { usePlayers, useTeams } from "@/hooks/useSupabaseData";
import { Trophy, ChevronRight } from "lucide-react";
import { useState } from "react";

const tabs = ["Dashboard", "Player", "Club", "All-time Stats", "Records"];

// Mock data for stats not in DB
const mockPlayerStats = [
  { name: "Getaneh Kebede", team: "Saint George Youth", shortName: "GK", goals: 19, assists: 12, passes: 1523, cleanSheets: 10 },
  { name: "Abebe Negash", team: "Ethiopian Coffee Academy", shortName: "AN", goals: 14, assists: 11, passes: 1487, cleanSheets: 8 },
  { name: "Samuel Tesfaye", team: "Adama U-17", shortName: "ST", goals: 12, assists: 9, passes: 1392, cleanSheets: 7 },
  { name: "Dawit Haile", team: "Hawassa Youth", shortName: "DH", goals: 11, assists: 8, passes: 1356, cleanSheets: 7 },
  { name: "Yonas Bekele", team: "Saint George Youth", shortName: "YB", goals: 10, assists: 7, passes: 1298, cleanSheets: 6 },
  { name: "Henok Girma", team: "Bahir Dar Academy", shortName: "HG", goals: 9, assists: 7, passes: 1298, cleanSheets: 5 },
  { name: "Biniam Tadesse", team: "Jimma Stars", shortName: "BT", goals: 8, assists: 6, passes: 1245, cleanSheets: 5 },
  { name: "Amanuel Desta", team: "Gondar United", shortName: "AD", goals: 8, assists: 6, passes: 1198, cleanSheets: 4 },
  { name: "Temesgen Alemu", team: "Dire Dawa FC", shortName: "TA", goals: 7, assists: 6, passes: 1156, cleanSheets: 4 },
  { name: "Eyasu Worku", team: "Mekelle Youth", shortName: "EW", goals: 7, assists: 5, passes: 1134, cleanSheets: 3 },
];

const mockClubStats = [
  { name: "Saint George Youth", shortName: "SG", goals: 44, tackles: 245, blocks: 93, passes: 11245 },
  { name: "Ethiopian Coffee Academy", shortName: "EC", goals: 38, tackles: 232, blocks: 87, passes: 10892 },
  { name: "Adama U-17", shortName: "AD", goals: 34, tackles: 221, blocks: 82, passes: 10456 },
  { name: "Hawassa Youth", shortName: "HW", goals: 31, tackles: 218, blocks: 79, passes: 9987 },
  { name: "Bahir Dar Academy", shortName: "BD", goals: 29, tackles: 209, blocks: 76, passes: 9654 },
  { name: "Jimma Stars", shortName: "JM", goals: 27, tackles: 198, blocks: 71, passes: 9321 },
  { name: "Gondar United", shortName: "GN", goals: 25, tackles: 192, blocks: 68, passes: 8976 },
  { name: "Dire Dawa FC", shortName: "DD", goals: 24, tackles: 187, blocks: 65, passes: 8654 },
  { name: "Mekelle Youth", shortName: "MK", goals: 22, tackles: 181, blocks: 62, passes: 8321 },
  { name: "Debre Birhan FC", shortName: "DB", goals: 20, tackles: 175, blocks: 58, passes: 7998 },
];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { data: players = [] } = usePlayers();
  const { data: teams = [] } = useTeams();

  // Merge real player data with mock for display
  const playerStats = players.length > 0 
    ? players.map((p, i) => ({
        name: p.name,
        team: teams.find(t => t.id === p.team_id)?.name || "Team",
        shortName: p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
        goals: p.goals || mockPlayerStats[i]?.goals || 0,
        assists: p.assists || mockPlayerStats[i]?.assists || 0,
        passes: mockPlayerStats[i]?.passes || 1000,
        cleanSheets: mockPlayerStats[i]?.cleanSheets || 0,
      }))
    : mockPlayerStats;

  const topGoals = [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 10);
  const topAssists = [...playerStats].sort((a, b) => b.assists - a.assists).slice(0, 10);
  const topPasses = [...mockPlayerStats].sort((a, b) => b.passes - a.passes).slice(0, 10);
  const topCleanSheets = [...mockPlayerStats].sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 10);

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-background py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary">Stats Centre</h1>
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
        {/* Player Stats Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">
              EYL 2025/26 <span className="text-primary">Player Stats</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Goals */}
            <LeaderboardCard 
              title="Goals" 
              data={topGoals} 
              valueKey="goals"
            />
            
            {/* Assists */}
            <LeaderboardCard 
              title="Assists" 
              data={topAssists} 
              valueKey="assists"
            />
            
            {/* Total Passes */}
            <LeaderboardCard 
              title="Total Passes" 
              data={topPasses} 
              valueKey="passes"
              valueColor="cyan"
            />
            
            {/* Clean Sheets */}
            <LeaderboardCard 
              title="Clean Sheets" 
              data={topCleanSheets} 
              valueKey="cleanSheets"
            />
          </div>
        </div>

        {/* Club Stats Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">
              EYL 2025/26 <span className="text-primary">Club Stats</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Goals */}
            <ClubLeaderboardCard 
              title="Goals" 
              data={mockClubStats} 
              valueKey="goals"
            />
            
            {/* Tackles Won */}
            <ClubLeaderboardCard 
              title="Tackles Won" 
              data={mockClubStats} 
              valueKey="tackles"
            />
            
            {/* Blocks */}
            <ClubLeaderboardCard 
              title="Blocks" 
              data={mockClubStats} 
              valueKey="blocks"
            />
            
            {/* Total Passes */}
            <ClubLeaderboardCard 
              title="Total Passes" 
              data={mockClubStats} 
              valueKey="passes"
            />
          </div>
        </div>

        {/* Notice Banner */}
        <div className="glass-card p-4 border-l-4 border-l-primary">
          <p className="text-sm text-muted-foreground">
            Some statistics are not available prior to the 2020/21 season.{" "}
            <a href="#" className="text-primary hover:underline">
              Click here for more details →
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}

interface LeaderboardCardProps {
  title: string;
  data: Array<{
    name: string;
    team: string;
    shortName: string;
    [key: string]: string | number;
  }>;
  valueKey: string;
  valueColor?: "gold" | "cyan";
}

function LeaderboardCard({ title, data, valueKey, valueColor = "gold" }: LeaderboardCardProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {data.slice(0, 10).map((player, index) => (
          <div 
            key={player.name + index}
            className="flex items-center gap-2 py-1"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              index === 0 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground"
            }`}>
              {index + 1}
            </span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
              index === 0 
                ? "bg-primary/20 text-primary" 
                : "bg-secondary text-muted-foreground"
            }`}>
              {player.shortName}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{player.name}</p>
              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {player.team}
              </p>
            </div>
            <span className={`text-sm font-bold ${
              valueColor === "cyan" ? "text-cyan-400" : "text-primary"
            }`}>
              {player[valueKey]?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ClubLeaderboardCardProps {
  title: string;
  data: Array<{
    name: string;
    shortName: string;
    [key: string]: string | number;
  }>;
  valueKey: string;
}

function ClubLeaderboardCard({ title, data, valueKey }: ClubLeaderboardCardProps) {
  const sortedData = [...data].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number));

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        {sortedData.slice(0, 10).map((club, index) => (
          <div 
            key={club.name + index}
            className="flex items-center gap-2 py-1"
          >
            <span className={`w-5 text-xs font-bold ${
              index === 0 ? "text-primary" : "text-muted-foreground"
            }`}>
              {index + 1}
            </span>
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
              index === 0 
                ? "bg-primary/20 text-primary" 
                : "bg-secondary text-muted-foreground"
            }`}>
              {club.shortName}
            </div>
            <span className="flex-1 text-sm truncate">{club.name}</span>
            <span className="text-sm font-bold text-primary">
              {(club[valueKey] as number).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
