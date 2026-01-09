import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useNewsById, useNews } from "@/hooks/useSupabaseData";
import { 
  Clock, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Link as LinkIcon,
  ChevronRight,
  User
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { EYLLogo } from "@/components/EYLLogo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useNewsById(id || "");
  const { data: allNews = [] } = useNews({ limit: 10 });
  
  // Get related articles (same category, excluding current)
  const relatedNews = allNews
    .filter((n) => n.id !== id && n.category === article?.category)
    .slice(0, 3);
  
  // If not enough in same category, fill with other articles
  const otherNews = allNews
    .filter((n) => n.id !== id && !relatedNews.find((r) => r.id === n.id))
    .slice(0, 3 - relatedNews.length);
  
  const relatedArticles = [...relatedNews, ...otherNews];

  const handleShare = async (platform: "twitter" | "facebook" | "copy") => {
    const url = window.location.href;
    const title = article?.title || "EYL News";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-fade-in">
          {/* Hero skeleton */}
          <div className="h-64 md:h-96 bg-muted animate-pulse" />
          
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="h-4 bg-muted animate-pulse w-1/4 mb-4 rounded" />
              <div className="h-10 bg-muted animate-pulse w-3/4 mb-4 rounded" />
              <div className="h-4 bg-muted animate-pulse w-1/2 mb-8 rounded" />
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
          <EYLLogo size={80} className="mx-auto mb-6 opacity-50" />
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The article you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/news">
            <Button size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="animate-fade-in">
        {/* Hero Image */}
        <div 
          className="h-64 md:h-96 bg-cover bg-center relative"
          style={{
            backgroundImage: article.image_url 
              ? `linear-gradient(to top, hsl(var(--background)) 0%, transparent 50%), url('${article.image_url}')`
              : `linear-gradient(to top, hsl(var(--background)) 0%, transparent 50%), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/news" className="hover:text-primary transition-colors">News</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
            </nav>

            {/* Category Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-bold uppercase rounded-full">
                {article.category}
              </span>
              {article.is_featured && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm font-bold uppercase rounded-full">
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">EYL Admin</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {format(new Date(article.published_at || article.created_at), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <EYLLogo size={20} />
                <span className="text-sm">Ethiopian Youth League</span>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed font-medium">
                {article.excerpt}
              </p>
            )}

            {/* Content */}
            {article.content && (
              <div className="prose prose-lg prose-invert max-w-none mb-12">
                <div className="text-foreground leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                  {article.content}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="glass-card p-6 mb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Share this article</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare("twitter")}
                    className="hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare("facebook")}
                    className="hover:bg-[#4267B2]/10 hover:border-[#4267B2] hover:text-[#4267B2] transition-all"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare("copy")}
                    className="hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">
                  Related <span className="text-primary">Articles</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((item) => (
                    <Link 
                      key={item.id}
                      to={`/news/${item.id}`}
                      className="glass-card overflow-hidden group hover:border-primary/50 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div 
                        className="h-32 bg-cover bg-center"
                        style={{
                          backgroundImage: item.image_url 
                            ? `url('${item.image_url}')`
                            : `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400')`
                        }}
                      />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-primary uppercase">{item.category}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.published_at || item.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back to News */}
            <div className="text-center pb-8">
              <Link to="/news">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All News
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
