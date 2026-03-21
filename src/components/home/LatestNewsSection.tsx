import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Clock } from "lucide-react";
import { useNews, useVideos } from "@/hooks/useSupabaseData";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { NEWS_CATEGORIES } from "@/lib/constants";

function formatViews(count: number | null): string {
  if (!count) return "0 views";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

// Convert short youtu.be URLs to full youtube.com/watch URLs
function getFullYouTubeUrl(url: string): string {
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return `https://www.youtube.com/watch?v=${shortMatch[1]}`;
  }
  return url;
}

export function LatestNewsSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: news = [], isLoading } = useNews({ limit: 4, category: selectedCategory });
  const { data: videos = [] } = useVideos({ limit: 4 });

  const featuredNews = news[0];
  const otherNews = news.slice(1, 4);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest News */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              Latest <span className="section-title-accent">News</span>
            </h2>
            <Link 
              to="/news"
              className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
            >
              All News
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {NEWS_CATEGORIES.slice(0, 5).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
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
                      <h3 className="font-bold text-lg group-hover:text-foreground transition-colors">
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
                    className="glass-card p-3 group hover:border-foreground/20 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase">{item.category}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(item.published_at || item.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-foreground transition-colors">
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
            {videos.length === 0 ? (
              <p className="text-muted-foreground text-sm">No videos available yet.</p>
            ) : (
              videos.map((video) => (
                <a 
                  key={video.id}
                  href={getFullYouTubeUrl(video.youtube_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-3 flex items-center gap-4 hover:border-foreground/20 transition-all cursor-pointer group block"
                >
                  <div 
                    className="w-20 h-14 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-cover bg-center"
                    style={video.thumbnail_url ? { backgroundImage: `url('${video.thumbnail_url}')` } : {}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                    <Play className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
                      {video.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">{formatViews(video.views_count)}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
