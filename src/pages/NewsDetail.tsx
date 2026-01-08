import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useNewsById } from "@/hooks/useSupabaseData";
import { Clock, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { EYLLogo } from "@/components/EYLLogo";
import { Button } from "@/components/ui/button";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useNewsById(id || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="h-64 glass-card animate-pulse mb-6" />
            <div className="h-8 glass-card animate-pulse mb-4 w-3/4" />
            <div className="h-4 glass-card animate-pulse mb-2 w-1/2" />
            <div className="space-y-2 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 glass-card animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/news">
            <Button>
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link to="/news" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          {/* Featured Image */}
          {article.image_url && (
            <div 
              className="h-64 md:h-80 rounded-2xl bg-cover bg-center mb-6"
              style={{ backgroundImage: `url('${article.image_url}')` }}
            />
          )}

          {/* Category & Date */}
          <div className="flex items-center gap-3 mb-4">
            <EYLLogo size={24} />
            <span className="text-sm font-bold text-primary uppercase">{article.category}</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(article.published_at || article.created_at), "MMMM d, yyyy")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Content */}
          {article.content && (
            <div className="prose prose-invert max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
