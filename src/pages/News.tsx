import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useNews, useVideos } from "@/hooks/useSupabaseData";
import { Clock, Image, FileText, Download, ExternalLink, Play, Eye, Instagram, Twitter, Facebook, Youtube, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { EYLLogo } from "@/components/EYLLogo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NEWS_CATEGORIES } from "@/lib/constants";

const socialLinks = [
  { name: "Instagram", icon: Instagram, handle: "@ethiopianyouthleague", url: "https://instagram.com/ethiopianyouthleague", color: "hover:text-pink-500" },
  { name: "Twitter/X", icon: Twitter, handle: "@EYL_official", url: "https://twitter.com/EYL_official", color: "hover:text-blue-400" },
  { name: "Facebook", icon: Facebook, handle: "Ethiopian Youth League", url: "https://facebook.com/ethiopianyouthleague", color: "hover:text-blue-600" },
  { name: "YouTube", icon: Youtube, handle: "EYL TV", url: "https://youtube.com/@EYLTV", color: "hover:text-red-500" }
];

const mediaKitItems = [
  { name: "EYL Logo Pack", description: "High-resolution logos in PNG, SVG, and EPS formats", size: "12 MB" },
  { name: "Brand Guidelines", description: "Official colors, typography, and usage rules", size: "4 MB" },
  { name: "Press Release Templates", description: "Official templates for news and announcements", size: "2 MB" },
  { name: "Photo Assets", description: "Official tournament and event photography", size: "85 MB" }
];

const pressContacts = [
  { name: "Media Relations", email: "media@ethiopianyouthleague.com", phone: "+251 911 222 333" },
  { name: "Press Accreditation", email: "press@ethiopianyouthleague.com", phone: "+251 911 444 555" },
  { name: "Partnership Inquiries", email: "partners@ethiopianyouthleague.com", phone: "+251 911 666 777" }
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

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: news = [], isLoading } = useNews({ category: selectedCategory });
  const { data: videos = [] } = useVideos({ limit: 6 });

  return (
    <Layout>
      {/* Hero - Compact */}
      <section className="relative py-8 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-3">
            <EYLLogo size={40} withGlow />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Media <span className="text-primary">Center</span>
              </h1>
              <p className="text-sm text-muted-foreground">News, highlights, and press resources</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 animate-fade-in">
        <Tabs defaultValue="news" className="w-full">
          {/* Horizontal Scroll Tabs */}
          <div className="scroll-container mb-6">
            <TabsList className="glass-card p-1 inline-flex gap-1">
              <TabsTrigger value="news" className="gap-2 text-sm">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
                News
              </TabsTrigger>
              <TabsTrigger value="highlights" className="gap-2 text-sm">
                <Play className="h-4 w-4" strokeWidth={1.5} />
                Highlights
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2 text-sm">
                <Image className="h-4 w-4" strokeWidth={1.5} />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="media-kit" className="gap-2 text-sm">
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Media Kit
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2 text-sm">
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                Contact
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Latest News Tab */}
          <TabsContent value="news">
            {/* Category Filters - Horizontal Scroll Pills */}
            <div className="scroll-container mb-4">
              {NEWS_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "pill-tab-active" : "pill-tab-inactive"}
                >
                  {category}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-[100px] animate-pulse" />
                ))}
              </div>
            ) : (
              /* Compact News Cards - Horizontal Layout */
              <div className="space-y-3">
                {news.map((item, index) => (
                  <Link 
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="news-card-compact group hover:border-primary/50 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400'}
                      alt={item.title}
                      className="news-card-compact-image"
                    />
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary uppercase">{item.category}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" strokeWidth={1.5} />
                          {formatDistanceToNow(new Date(item.published_at || item.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[15px] leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {news.length === 0 && !isLoading && (
              <div className="glass-card p-10 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="font-semibold text-sm mb-1">No articles found</h3>
                <p className="text-xs text-muted-foreground">Check back later for updates.</p>
              </div>
            )}
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.length > 0 ? (
                videos.map((video, index) => {
                  const youtubeId = extractYouTubeId(video.youtube_url);
                  const thumbnailUrl = video.thumbnail_url || 
                    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null);

                  return (
                    <a 
                      key={video.id}
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card overflow-hidden group hover:border-primary/50 transition-all"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative aspect-video bg-secondary">
                        {thumbnailUrl && (
                          <img 
                            src={thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-primary-foreground ml-0.5" strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        {video.views_count && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Eye className="h-3 w-3" strokeWidth={1.5} />
                            {video.views_count.toLocaleString()} views
                          </p>
                        )}
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="col-span-full glass-card p-10 text-center">
                  <Play className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                  <h3 className="font-semibold text-sm mb-1">No highlights available</h3>
                  <p className="text-xs text-muted-foreground">Video highlights will appear here after matches.</p>
                </div>
              )}
            </div>

            {/* YouTube CTA */}
            <div className="glass-card p-4 mt-6 border-red-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <Youtube className="h-5 w-5 text-red-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Subscribe to EYL TV</h3>
                    <p className="text-xs text-muted-foreground">Never miss a highlight</p>
                  </div>
                </div>
                <a 
                  href="https://youtube.com/@EYLTV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors touch-target"
                >
                  <Youtube className="h-4 w-4" strokeWidth={1.5} />
                  Subscribe
                </a>
              </div>
            </div>
          </TabsContent>

          {/* Photo Gallery Tab */}
          <TabsContent value="gallery">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400",
                "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400",
                "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400",
                "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400",
                "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400",
                "https://images.unsplash.com/photo-1529629468155-5e37b2fc79fc?w=400",
                "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400",
                "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400"
              ].map((url, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img 
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>

            <div className="glass-card p-6 mt-6 text-center">
              <Image className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="font-semibold text-sm mb-1">More Photos Coming Soon</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Our gallery is being updated with the latest tournament images.
              </p>
              <p className="text-xs text-muted-foreground">
                For inquiries: <a href="mailto:media@ethiopianyouthleague.com" className="text-primary hover:underline">media@ethiopianyouthleague.com</a>
              </p>
            </div>
          </TabsContent>

          {/* Media Kit Tab */}
          <TabsContent value="media-kit">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {mediaKitItems.map((item, index) => (
                <div 
                  key={item.name}
                  className="glass-card p-4 flex items-center justify-between hover:border-primary/50 transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Download className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="h-3 w-3" strokeWidth={1.5} />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            {/* Usage Guidelines */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-bold mb-3">Usage Guidelines</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>• EYL logos and assets may only be used with prior written permission</p>
                <p>• Do not alter, distort, or recolor official logos</p>
                <p>• Always maintain clear space around logos as specified</p>
                <p>• For commercial use, contact our partnership team</p>
                <p>• Photo credits must include "Ethiopian Youth League" or "EYL"</p>
              </div>
            </div>
          </TabsContent>

          {/* Press Contact Tab */}
          <TabsContent value="contact">
            {/* Social Media Links */}
            <div className="glass-card p-4 mb-4">
              <h3 className="text-sm font-bold mb-3">Follow Us</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors touch-target ${social.color}`}
                  >
                    <social.icon className="h-5 w-5" strokeWidth={1.5} />
                    <div>
                      <p className="font-medium text-sm">{social.name}</p>
                      <p className="text-[11px] text-muted-foreground">{social.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Press Contacts */}
            <div className="grid md:grid-cols-3 gap-4">
              {pressContacts.map((contact, index) => (
                <div 
                  key={contact.name}
                  className="glass-card p-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="font-bold text-sm mb-3">{contact.name}</h3>
                  <div className="space-y-2">
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {contact.email}
                    </a>
                    <a 
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Press Accreditation */}
            <div className="glass-card p-4 mt-4 border-primary/30">
              <h3 className="font-bold text-sm mb-2">Press Accreditation</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Media professionals seeking accreditation for EYL events should apply at least 
                7 days before the event date.
              </p>
              <Button className="gap-2 text-sm h-9">
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                Apply for Accreditation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
