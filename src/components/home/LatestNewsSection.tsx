import { Link } from "react-router-dom";
import { ArrowRight, Play, Clock } from "lucide-react";
import { useNews } from "@/hooks/useSupabaseData";
import { formatDistanceToNow } from "date-fns";

const mockVideos = [
  { id: 1, title: "Goals of the Week: Matchday 12", views: "8.5K views", thumbnail: null },
  { id: 2, title: "Best Saves: U-17 Addis Premier", views: "6K views", thumbnail: null },
  { id: 3, title: "Skills Showcase: Biruk Hailu", views: "12K views", thumbnail: null },
  { id: 4, title: "Behind the Scenes: Arada FC Training", views: "9K views", thumbnail: null },
];

export function LatestNewsSection() {
  const { data: news = [], isLoading } = useNews({ limit: 4 });

  const featuredNews = news[0];
  const otherNews = news.slice(1, 4);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest News */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">
              Latest <span className="section-title-accent">News</span>
            </h2>
            <Link 
              to="/news"
              className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1"
            >
              All News
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Featured Article */}
              {featuredNews && (
                <Link to={`/news/${featuredNews.id}`} className="block group">
                  <div 
                    className="glass-card h-48 rounded-xl bg-cover bg-center relative overflow-hidden"
                    style={{
                      backgroundImage: featuredNews.image_url 
                        ? `linear-gradient(to top, rgba(14, 27, 49, 0.95), rgba(14, 27, 49, 0.3)), url('${featuredNews.image_url}')`
                        : `linear-gradient(to top, rgba(14, 27, 49, 0.95), rgba(14, 27, 49, 0.3)), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600')`
                    }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary uppercase">{featuredNews.category}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(featuredNews.published_at || featuredNews.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {featuredNews.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              )}

              {/* Other News */}
              <div className="grid grid-cols-2 gap-4">
                {otherNews.map((item) => (
                  <Link 
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="glass-card p-3 group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase">{item.category}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(item.published_at || item.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Latest Videos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">
              Latest <span className="section-title-accent">Videos</span>
            </h2>
          </div>

          <div className="space-y-3">
            {mockVideos.map((video) => (
              <div 
                key={video.id}
                className="glass-card p-3 flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="w-20 h-14 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                  <Play className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">{video.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
