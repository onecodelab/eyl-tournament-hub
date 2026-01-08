import { Layout } from "@/components/layout/Layout";
import { useNews } from "@/hooks/useSupabaseData";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { EYLLogo } from "@/components/EYLLogo";

export default function NewsPage() {
  const { data: news = [], isLoading } = useNews();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-2">
          <EYLLogo size={50} withGlow />
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Latest <span className="text-primary">News</span>
            </h1>
            <p className="text-muted-foreground">Stay updated with Ethiopian Youth League coverage</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link 
                key={item.id}
                to={`/news/${item.id}`}
                className="glass-card overflow-hidden group hover:border-primary/50 transition-all"
              >
                <div 
                  className="h-40 bg-cover bg-center"
                  style={{
                    backgroundImage: item.image_url 
                      ? `url('${item.image_url}')`
                      : `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400')`
                  }}
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <EYLLogo size={16} />
                    <span className="text-xs font-bold text-primary uppercase">{item.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.published_at || item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
