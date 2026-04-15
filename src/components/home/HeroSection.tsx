import { Link } from "react-router-dom";
import { ArrowRight, Clock, Newspaper, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNews, useMatchWithTeams } from "@/hooks/useSupabaseData";
import { format } from "date-fns";
import { useState, useEffect, useCallback } from "react";

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
  const heroSlides = news.slice(0, 4);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = useCallback(() => {
    if (heroSlides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [nextSlide, heroSlides.length]);

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

  const currentHero = heroSlides[currentSlide] || featuredNews;

  return (
    <section className="bg-background">
      {/* Mobile: Full-bleed hero carousel */}
      <div className="lg:hidden">
        <div className="relative w-full min-h-[80vh] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="absolute inset-0 w-full h-full bg-cover bg-center flex flex-col justify-end transition-opacity duration-700 ease-in-out"
              style={{
                backgroundImage: slide.image_url
                  ? `url('${slide.image_url}')`
                  : `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop')`,
                opacity: index === currentSlide ? 1 : 0,
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              {/* Dark Gradient Overlay for optimal readability on white text */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1b31] via-[#0e1b31]/40 to-transparent" />
            </div>
          ))}

          {liveMatch && (
            <div className="absolute top-6 left-6 z-10">
              <span className="live-badge flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE ACTION
              </span>
            </div>
          )}

          <div className="relative z-10 p-6 pb-12 mt-auto flex flex-col justify-end min-h-[80vh]">
            <div className="data-precision-mono text-primary font-bold mb-2 tracking-[0.2em]">TOP STORY</div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6 leading-tight tracking-tight uppercase italic drop-shadow-lg">
              {currentHero?.title || "JAN MEDA SHOWDOWN: ARADA VS ADDIS"}
            </h2>
            <div className="flex items-center justify-between gap-4">
              <Link to={currentHero ? `/news/${currentHero.id}` : "/news"} className="flex-1">
                <Button className="w-full bg-eyl-gradient text-white font-black rounded-full h-12 shadow-[0_0_20px_hsl(187,100%,50%,0.4)] transition-all active:scale-95">
                  READ ARTICLE
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {/* Dot indicators */}
              {heroSlides.length > 1 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "w-8 bg-primary"
                          : "w-2 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Match center highlights — removed problematic overlap */}
        {(todayMatches.length > 0 || tomorrowMatches.length > 0 || liveMatch) && (
          <div className="container mx-auto px-4 py-6 relative z-20">
            <MatchCenterCard 
              todayMatches={todayMatches} 
              tomorrowMatches={tomorrowMatches} 
              liveMatch={liveMatch} 
            />
          </div>
        )}
      </div>

      {/* Desktop: Superior LALIGA-style Asymmetrical Layout */}
      <div className="hidden lg:block container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6 items-stretch">
          
          {/* Main Hero Story - span-7 (Asymmetrical) */}
          <div className="col-span-7 flex flex-col">
            <div 
              className="relative h-full min-h-[500px] rounded-3xl overflow-hidden bg-cover bg-center border border-white/10 group cursor-pointer"
              style={{ 
                backgroundImage: featuredNews?.image_url
                  ? `linear-gradient(to top, rgba(14, 27, 49, 1) 0%, rgba(14, 27, 49, 0.2) 50%, rgba(14, 27, 49, 0.1) 100%), url('${featuredNews.image_url}')`
                  : `linear-gradient(to top, rgba(14, 27, 49, 1) 0%, rgba(14, 27, 49, 0.2) 50%, rgba(14, 27, 49, 0.1) 100%), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop')` 
              }}
            >
              {liveMatch && (
                <div className="absolute top-8 left-8">
                  <span className="live-badge flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full" />
                    MATCH DAY LIVE
                  </span>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <div className="data-precision-mono text-primary font-bold mb-3 tracking-[0.3em]">HEADLINE STORY</div>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter uppercase italic max-w-2xl transform transition-transform group-hover:-translate-y-1">
                  {featuredNews?.title || "JAN MEDA SHOWDOWN: ARADA VS ADDIS"}
                </h2>
                <div className="flex items-center gap-6">
                  <Link to={featuredNews ? `/news/${featuredNews.id}` : "/news"}>
                    <Button className="bg-eyl-gradient text-white font-black px-10 h-14 rounded-full shadow-[0_0_30px_hsl(187,100%,50%,0.3)] hover:shadow-[0_0_40px_hsl(187,100%,50%,0.5)] transition-all">
                      EXPLORE ARTICLE
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </Link>
                  <span className="text-white/40 data-precision-mono text-xs">OFFICIAL REPORT // 2026 EDITION</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Intelligence - span-5 (Asymmetrical) */}
          <div className="col-span-5 flex flex-col gap-6">
            {/* Match Center - Premier League Style Density */}
            {(todayMatches.length > 0 || tomorrowMatches.length > 0 || liveMatch) && (
              <div className="flex-1">
                <MatchCenterCard 
                  todayMatches={todayMatches} 
                  tomorrowMatches={tomorrowMatches} 
                  liveMatch={liveMatch} 
                />
              </div>
            )}

            {/* Sub-news Feed */}
            <div className={`glass-card p-6 flex flex-col justify-between border-white/5 ${(!todayMatches.length && !tomorrowMatches.length && !liveMatch) ? 'flex-1' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="data-precision-mono text-primary font-bold">LATEST UPDATES</h3>
                <Link to="/news" className="text-[10px] text-white/40 hover:text-white transition-colors">SEE ALL NEWS</Link>
              </div>
              <div className="space-y-4">
                {latestNews.slice(1, 4).map((item) => (
                  <NewsItem key={item.id} item={item} />
                ))}
              </div>
            </div>
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
    home_team?: { name: string; short_name: string | null; logo_url?: string | null } | null;
    away_team?: { name: string; short_name: string | null; logo_url?: string | null } | null;
  };
}

function MatchCenterItem({ match }: MatchCenterItemProps) {
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";

  return (
    <div className="bg-secondary/50 rounded-lg p-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {match.home_team?.logo_url ? (
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <img src={match.home_team.logo_url} className="w-4 h-4 object-contain scale-125 drop-shadow-sm" alt="Home" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary flex-shrink-0">
              {match.home_team?.short_name?.slice(0, 2) || "HT"}
            </div>
          )}
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
          {match.away_team?.logo_url ? (
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <img src={match.away_team.logo_url} className="w-4 h-4 object-contain scale-125 drop-shadow-sm" alt="Away" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold text-muted-foreground flex-shrink-0">
              {match.away_team?.short_name?.slice(0, 2) || "AT"}
            </div>
          )}
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
