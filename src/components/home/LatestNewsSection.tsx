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
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
          Latest <span className="text-primary">Intelligence</span>
        </h2>
        <Link 
          to="/news"
          className="data-precision-mono text-white/40 hover:text-white text-[10px] flex items-center gap-1.5 transition-colors tracking-widest uppercase"
        >
          Explore All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="news-grid-laliga">
        {/* Featured News - LALIGA Style */}
        <div>
          {isLoading ? (
            <div className="glass-card h-[400px] animate-pulse rounded-2xl" />
          ) : featuredNews && (
            <Link to={`/news/${featuredNews.id}`} className="block group h-full">
              <div 
                className="glass-card h-[400px] rounded-2xl bg-cover bg-center relative overflow-hidden transition-all duration-500 group-hover:border-primary/50"
                style={{
                  backgroundImage: featuredNews.image_url 
                    ? `linear-gradient(to top, rgba(14, 27, 49, 1), rgba(14, 27, 49, 0.4)), url('${featuredNews.image_url}')`
                    : `linear-gradient(to top, rgba(14, 27, 49, 1), rgba(14, 27, 49, 0.4)), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800')`
                }}
              >
                <div className="absolute top-6 left-6">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">
                    Featured Story
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="data-precision-mono text-primary font-bold uppercase">{featuredNews.category}</span>
                    <span className="data-precision-mono text-white/30 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(featuredNews.published_at || featuredNews.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black group-hover:text-primary transition-colors leading-tight italic uppercase tracking-tight">
                    {featuredNews.title}
                  </h3>
                  <p className="mt-4 text-white/40 line-clamp-2 max-w-xl hidden md:block text-sm">
                    {featuredNews.content?.replace(/<[^>]*>/g, '').slice(0, 160)}...
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Side Section - Videos + Mini News */}
        <div className="flex flex-col gap-6">
          <h3 className="text-sm font-black italic uppercase tracking-tight">Prime <span className="text-primary">Media</span></h3>

          <div className="flex flex-col gap-3">
            {videos.slice(0, 4).map((video) => (
              <a 
                key={video.id}
                href={getFullYouTubeUrl(video.youtube_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-3 flex items-center gap-4 hover:border-primary/30 transition-all group overflow-hidden"
              >
                <div 
                  className="w-24 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-cover bg-center border border-white/5"
                  style={video.thumbnail_url ? { backgroundImage: `url('${video.thumbnail_url}')` } : {}}
                >
                  <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors" />
                  <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-lg">
                    <Play className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate leading-snug group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <span className="data-precision-mono text-white/30">{formatViews(video.views_count)}</span>
                </div>
              </a>
            ))}
          </div>

          {/* Mini News Feed */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {otherNews.slice(0, 2).map((item) => (
              <Link 
                key={item.id}
                to={`/news/${item.id}`}
                className="glass-card p-3 group hover:bg-white/5 transition-all h-24 flex flex-col justify-between"
              >
                <span className="data-precision-mono text-primary font-bold uppercase">{item.category}</span>
                <h4 className="font-bold text-xs line-clamp-2 leading-tight">{item.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
