import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useNews, useVideos } from "@/hooks/useSupabaseData";
import { Clock, FileText, Download, ExternalLink, Play, Eye, Instagram, Twitter, Facebook, Youtube, Mail, ArrowRight, Sparkles, Camera } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NEWS_CATEGORIES } from "@/lib/constants";

const socialLinks = [
  { name: "Instagram", icon: Instagram, handle: "@ethiopianyouthleague", url: "https://instagram.com/ethiopianyouthleague", gradient: "from-pink-500/20 to-purple-500/20", iconColor: "text-pink-400" },
  { name: "Twitter/X", icon: Twitter, handle: "@EYL_official", url: "https://twitter.com/EYL_official", gradient: "from-sky-500/20 to-blue-500/20", iconColor: "text-sky-400" },
  { name: "Facebook", icon: Facebook, handle: "Ethiopian Youth League", url: "https://facebook.com/ethiopianyouthleague", gradient: "from-blue-500/20 to-indigo-500/20", iconColor: "text-blue-400" },
  { name: "YouTube", icon: Youtube, handle: "EYL TV", url: "https://youtube.com/@EYLTV", gradient: "from-red-500/20 to-orange-500/20", iconColor: "text-red-400" }
];

const mediaKitItems = [
  { name: "EYL Logo Pack", description: "High-resolution logos in PNG, SVG, and EPS formats", size: "12 MB", icon: "🎨" },
  { name: "Brand Guidelines", description: "Official colors, typography, and usage rules", size: "4 MB", icon: "📐" },
  { name: "Press Release Templates", description: "Official templates for news and announcements", size: "2 MB", icon: "📝" },
  { name: "Photo Assets", description: "Official tournament and event photography", size: "85 MB", icon: "📸" }
];

const pressContacts = [
  { name: "Media Relations", email: "media@ethiopianyouthleague.com", phone: "+251 911 222 333" },
  { name: "Press Accreditation", email: "press@ethiopianyouthleague.com", phone: "+251 911 444 555" },
  { name: "Partnership Inquiries", email: "partners@ethiopianyouthleague.com", phone: "+251 911 666 777" }
];

const galleryImages = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600",
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600",
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600",
  "https://images.unsplash.com/photo-1529629468155-5e37b2fc79fc?w=600",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600"
];

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

type TabKey = "news" | "highlights" | "gallery" | "media-kit" | "contact";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "news", label: "News", icon: FileText },
  { key: "highlights", label: "Highlights", icon: Play },
  { key: "gallery", label: "Gallery", icon: Camera },
  { key: "media-kit", label: "Media Kit", icon: Download },
  { key: "contact", label: "Contact", icon: Mail },
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<TabKey>("news");
  const { data: news = [], isLoading } = useNews({ category: selectedCategory });
  const { data: videos = [] } = useVideos({ limit: 6 });

  const featuredNews = news[0];
  const restNews = news.slice(1);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-background pt-8 pb-4">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              Stories & <span className="text-primary">Highlights</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-[64px] z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <tab.icon className="h-4 w-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* NEWS TAB */}
        {activeTab === "news" && (
          <div className="animate-fade-in">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6">
              {NEWS_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === category
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "text-muted-foreground border-border/50 hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-[340px] rounded-2xl bg-secondary/30 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-[200px] rounded-xl bg-secondary/30 animate-pulse" />
                  ))}
                </div>
              </div>
            ) : news.length === 0 ? (
              <div className="glass-card p-16 text-center rounded-2xl">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold mb-1">No articles found</h3>
                <p className="text-sm text-muted-foreground">Try selecting a different category.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Featured Article — Full Width Hero Card */}
                {featuredNews && (
                  <Link to={`/news/${featuredNews.id}`} className="block group">
                    <div className="relative h-[340px] md:h-[400px] rounded-2xl overflow-hidden">
                      <img
                        src={featuredNews.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200"}
                        alt={featuredNews.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="default" className="text-[10px] uppercase tracking-wider font-bold">
                            {featuredNews.category || "General"}
                          </Badge>
                          <span className="text-xs text-foreground/60 flex items-center gap-1">
                            <Clock className="h-3 w-3" strokeWidth={1.5} />
                            {formatDistanceToNow(new Date(featuredNews.published_at || featuredNews.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors max-w-2xl">
                          {featuredNews.title}
                        </h2>
                        {featuredNews.excerpt && (
                          <p className="text-sm text-muted-foreground mt-2 max-w-xl line-clamp-2">{featuredNews.excerpt}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-primary text-sm font-medium mt-4 group-hover:gap-3 transition-all">
                          Read article <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Rest of News — Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restNews.map((item, index) => (
                    <Link
                      key={item.id}
                      to={`/news/${item.id}`}
                      className="group rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 animate-fade-in"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold bg-background/80 backdrop-blur-sm">
                            {item.category || "General"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" strokeWidth={1.5} />
                          {item.published_at
                            ? format(new Date(item.published_at), "MMM d, yyyy")
                            : formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </div>
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        {item.excerpt && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{item.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HIGHLIGHTS TAB */}
        {activeTab === "highlights" && (
          <div className="animate-fade-in space-y-6">
            {videos.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video, index) => {
                  const youtubeId = extractYouTubeId(video.youtube_url);
                  const thumbnailUrl = video.thumbnail_url ||
                    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null);

                  return (
                    <a
                      key={video.id}
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 animate-fade-in"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="relative aspect-video bg-secondary">
                        {thumbnailUrl && (
                          <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-primary/30">
                            <Play className="h-6 w-6 text-primary-foreground ml-0.5" strokeWidth={2} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        {video.views_count != null && (
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            <Eye className="h-3 w-3" strokeWidth={1.5} />
                            {video.views_count.toLocaleString()} views
                          </p>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-16 text-center rounded-2xl">
                <Play className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold mb-1">No highlights available</h3>
                <p className="text-sm text-muted-foreground">Video highlights will appear here after matches.</p>
              </div>
            )}

            {/* YouTube CTA */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <Youtube className="h-6 w-6 text-red-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Subscribe to EYL TV</h3>
                    <p className="text-xs text-muted-foreground">Never miss a highlight or match recap</p>
                  </div>
                </div>
                <a
                  href="https://youtube.com/@EYLTV"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-red-500 hover:bg-red-600 text-white gap-2 rounded-xl">
                    <Youtube className="h-4 w-4" strokeWidth={1.5} />
                    Subscribe
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === "gallery" && (
          <div className="animate-fade-in space-y-6">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {galleryImages.map((url, index) => (
                <div
                  key={index}
                  className="break-inside-avoid rounded-xl overflow-hidden group cursor-pointer border border-border/30 hover:border-primary/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative">
                    <img
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ aspectRatio: index % 3 === 0 ? "3/4" : index % 2 === 0 ? "1/1" : "4/3" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/50 p-8 text-center bg-card">
              <Camera className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="font-semibold text-sm mb-1">More Photos Coming Soon</h3>
              <p className="text-xs text-muted-foreground mb-3">Our gallery is being updated with the latest tournament images.</p>
              <p className="text-xs text-muted-foreground">
                For inquiries: <a href="mailto:media@ethiopianyouthleague.com" className="text-primary hover:underline">media@ethiopianyouthleague.com</a>
              </p>
            </div>
          </div>
        )}

        {/* MEDIA KIT TAB */}
        {activeTab === "media-kit" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {mediaKitItems.map((item, index) => (
                <div
                  key={item.name}
                  className="group rounded-xl border border-border/50 bg-card p-5 flex items-start gap-4 hover:border-primary/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">{item.size}</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 shrink-0 rounded-lg">
                    <Download className="h-3 w-3" strokeWidth={1.5} />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-bold mb-3">Usage Guidelines</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>• EYL logos may only be used with prior written permission</p>
                <p>• Do not alter, distort, or recolor official logos</p>
                <p>• Maintain clear space around logos as specified</p>
                <p>• For commercial use, contact our partnership team</p>
                <p>• Photo credits must include "Ethiopian Youth League" or "EYL"</p>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <div className="animate-fade-in space-y-6">
            {/* Social Media */}
            <div>
              <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Follow Us</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${social.gradient} flex items-center justify-center mb-3`}>
                      <social.icon className={`h-5 w-5 ${social.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <p className="font-semibold text-sm">{social.name}</p>
                    <p className="text-xs text-muted-foreground">{social.handle}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Press Contacts */}
            <div>
              <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Press Contacts</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {pressContacts.map((contact, index) => (
                  <div
                    key={contact.name}
                    className="rounded-xl border border-border/50 bg-card p-5 animate-fade-in"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <h4 className="font-bold text-sm mb-3">{contact.name}</h4>
                    <div className="space-y-2">
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {contact.email}
                      </a>
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
