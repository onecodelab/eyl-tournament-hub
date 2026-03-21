import { Link } from "react-router-dom";
import { ArrowRight, Clock, Newspaper, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNews, useMatchWithTeams } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

const newsCategories: Record<string, string> = {
  "Breakthrough": "TALENT SPOTLIGHT",
  "Match Report": "MATCH REPORT",
  "Scouting": "ACADEMY NEWS",
  "General": "TRANSFER WATCH",
};

export function HeroSection() {
  const { data: news = [] } = useNews({ limit: 4 });
  const { data: matches = [] } = useMatchWithTeams();

  const featuredNews = news[0];
  const latestNews = news.slice(0, 4);
  
  const todayMatches = matches.filter((m) => {
    if (!m.match_date) return false;
    const matchDate = new Date(m.match_date);
    const today = new Date();
    return matchDate.toDateString() === today.toDateString();
  });

  const tomorrowMatches = matches.filter((m) => {
    if (!m.match_date) return false;
    const matchDate = new Date(m.match_date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return matchDate.toDateString() === tomorrow.toDateString();
  });

  const liveMatch = matches.find((m) => m.status === "live");

  return (
    <section>
      {/* Mobile: Full-bleed hero like RB Leipzig */}
      <div className="lg:hidden">
        <div 
          className="relative w-full min-h-[75vh] bg-cover bg-center flex flex-col justify-end"
          style={{ 
            backgroundImage: featuredNews?.image_url
              ? `url('${featuredNews.image_url}')`
              : `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop')` 
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
          
          {liveMatch && (
            <div className="absolute top-4 left-4 z-10">
              <span className="live-badge flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            </div>
          )}

          <div className="relative z-10 p-6 pb-8">
            <h2 className="text-3xl font-extrabold text-white mb-3 leading-[1.1] tracking-tight uppercase">
              {featuredNews?.title || "JAN MEDA SHOWDOWN: ARADA VS ADDIS"}
            </h2>
            <Button variant="secondary" size="sm" className="group rounded-full px-6 py-2.5 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all">
              Read article
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Mobile: News + Match cards below hero */}
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Latest News */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                <Newspaper className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Latest News</h3>
            </div>
            <div className="space-y-3">
              {latestNews.map((item) => (
                <NewsItem key={item.id} item={item} />
              ))}
            </div>
            <Link 
              to="/news"
              className="flex items-center justify-end gap-1 text-muted-foreground hover:text-foreground text-sm mt-3 transition-colors"
            >
              View All News
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Match Center */}
          <MatchCenterCard 
            todayMatches={todayMatches} 
            tomorrowMatches={tomorrowMatches} 
            liveMatch={liveMatch} 
          />
        </div>
      </div>

      {/* Desktop: Original 3-column layout */}
      <div className="hidden lg:block container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">
            <div 
              className="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl shadow-primary/10 border border-white/5"
              style={{ 
                backgroundImage: featuredNews?.image_url
                  ? `linear-gradient(to bottom, rgba(10, 22, 40, 0.1) 0%, rgba(10, 22, 40, 0.4) 40%, rgba(10, 22, 40, 0.95) 85%), url('${featuredNews.image_url}')`
                  : `linear-gradient(to bottom, rgba(10, 22, 40, 0.1) 0%, rgba(10, 22, 40, 0.4) 40%, rgba(10, 22, 40, 0.95) 85%), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop')` 
              }}
            >
              {liveMatch && (
                <div className="absolute top-4 left-4">
                  <span className="live-badge flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
                <h2 className="text-3xl font-bold text-white mb-3 leading-tight tracking-tight">
                  {featuredNews?.title || "JAN MEDA SHOWDOWN: ARADA VS ADDIS"}
                </h2>
                <p className="text-white/50 text-sm mb-5 font-light">Tonight Under the Lights</p>
                <Button variant="secondary" size="sm" className="group rounded-full px-5 backdrop-blur-sm bg-white/90 text-background hover:bg-white transition-all">
                  Read Full Story
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>

          {/* Latest News - Middle Column */}
          <div className="col-span-4">
            <div className="glass-card h-full p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                  <Newspaper className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Latest News</h3>
              </div>
              <div className="space-y-3">
                {latestNews.map((item) => (
                  <NewsItem key={item.id} item={item} />
                ))}
              </div>
              <Link 
                to="/news"
                className="flex items-center justify-end gap-1 text-muted-foreground hover:text-foreground text-sm mt-3 transition-colors"
              >
                View All News
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Match Center - Right Column */}
          <div className="col-span-3">
            <MatchCenterCard 
              todayMatches={todayMatches} 
              tomorrowMatches={tomorrowMatches} 
              liveMatch={liveMatch} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsItem({ item }: { item: { id: string; image_url: string | null; category: string | null; title: string } }) {
  return (
    <Link 
      to={`/news/${item.id}`}
      className="flex gap-3 p-2 rounded-lg hover:bg-secondary/70 transition-colors group"
    >
      <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">EYL</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-primary text-[10px] font-bold uppercase tracking-wider">
          {newsCategories[item.category || "General"] || item.category}
        </span>
        <p className="text-sm font-medium text-foreground line-clamp-2 mt-0.5 group-hover:text-foreground transition-colors">
          {item.title}
        </p>
      </div>
    </Link>
  );
}

interface MatchCenterCardProps {
  todayMatches: any[];
  tomorrowMatches: any[];
  liveMatch: any;
}

function MatchCenterCard({ todayMatches, tomorrowMatches, liveMatch }: MatchCenterCardProps) {
  return (
    <div className="glass-card h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <Trophy className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Match Center</h3>
        </div>
        <Link to="/matches" className="text-muted-foreground hover:text-foreground text-xs">
          View all →
        </Link>
      </div>
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">TODAY</span>
        <div className="mt-2 space-y-2">
          {todayMatches.length > 0 ? (
            todayMatches.slice(0, 2).map((match: any) => (
              <MatchCenterItem key={match.id} match={match} />
            ))
          ) : liveMatch ? (
            <MatchCenterItem match={liveMatch} />
          ) : (
            <p className="text-xs text-muted-foreground py-2">No matches today</p>
          )}
        </div>
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">TOMORROW</span>
        <div className="mt-2 space-y-2">
          {tomorrowMatches.length > 0 ? (
            tomorrowMatches.slice(0, 2).map((match: any) => (
              <MatchCenterItem key={match.id} match={match} />
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-2">No matches scheduled</p>
          )}
        </div>
      </div>
      <Button className="w-full mt-4 bg-secondary text-foreground hover:bg-secondary/80 border border-border">
        <Clock className="mr-2 h-4 w-4" />
        EYL Stream
      </Button>
    </div>
  );
}

interface MatchCenterItemProps {
  match: {
    id: string;
    status: string | null;
    home_score: number | null;
    away_score: number | null;
    match_date: string | null;
    home_team?: { name: string; short_name: string | null } | null;
    away_team?: { name: string; short_name: string | null } | null;
  };
}

function MatchCenterItem({ match }: MatchCenterItemProps) {
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";

  return (
    <div className="bg-secondary/50 rounded-lg p-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary flex-shrink-0">
            {match.home_team?.short_name?.slice(0, 2) || "HT"}
          </div>
          <span className="truncate text-foreground">{match.home_team?.name || "Home Team"}</span>
        </div>
        {isLive && (
          <div className="flex items-center gap-1 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-destructive font-bold text-[10px]">LIVE NOW</span>
          </div>
        )}
        {isCompleted && (
          <span className="font-bold text-primary px-2">
            {match.home_score ?? 0}
          </span>
        )}
        {!isLive && !isCompleted && match.match_date && (
          <span className="text-primary font-medium px-2">
            {format(new Date(match.match_date), "HH:mm")}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs mt-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold text-muted-foreground flex-shrink-0">
            {match.away_team?.short_name?.slice(0, 2) || "AT"}
          </div>
          <span className="truncate text-foreground">{match.away_team?.name || "Away Team"}</span>
        </div>
        {isCompleted && (
          <span className="font-bold text-primary px-2">
            {match.away_score ?? 0}
          </span>
        )}
      </div>
    </div>
  );
}
