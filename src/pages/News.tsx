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
      {/* Hero */}
      <section className="relative py-12 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4">
            <EYLLogo size={50} withGlow />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Media <span className="text-primary">Center</span>
              </h1>
              <p className="text-muted-foreground">News, highlights, galleries, and press resources</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="glass-card p-1 mb-8 inline-flex flex-wrap">
            <TabsTrigger value="news" className="gap-2">
              <FileText className="h-4 w-4" />
              Latest News
            </TabsTrigger>
            <TabsTrigger value="highlights" className="gap-2">
              <Play className="h-4 w-4" />
              Highlights
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              Photo Gallery
            </TabsTrigger>
            <TabsTrigger value="media-kit" className="gap-2">
              <Download className="h-4 w-4" />
              Media Kit
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Mail className="h-4 w-4" />
              Press Contact
            </TabsTrigger>
          </TabsList>

          {/* Latest News Tab */}
          <TabsContent value="news">
            {/* Category Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {NEWS_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-64 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, index) => (
                  <Link 
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="glass-card overflow-hidden group hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div 
                      className="h-40 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
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

            {news.length === 0 && !isLoading && (
              <div className="glass-card p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">Check back later for updates.</p>
              </div>
            )}
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 text-primary-foreground ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        {video.views_count && (
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {video.views_count.toLocaleString()} views
                          </p>
                        )}
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="col-span-full glass-card p-12 text-center">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No highlights available</h3>
                  <p className="text-muted-foreground">Video highlights will appear here after matches.</p>
                </div>
              )}
            </div>

            {/* YouTube CTA */}
            <div className="glass-card p-6 mt-8 border-red-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <Youtube className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">Subscribe to EYL TV</h3>
                    <p className="text-sm text-muted-foreground">Never miss a highlight, interview, or behind-the-scenes content</p>
                  </div>
                </div>
                <a 
                  href="https://youtube.com/@EYLTV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                  Subscribe
                </a>
              </div>
            </div>
          </TabsContent>

          {/* Photo Gallery Tab */}
          <TabsContent value="gallery">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

            <div className="glass-card p-6 mt-8 text-center">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">More Photos Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Our photo gallery is being updated with the latest tournament images.
              </p>
              <p className="text-sm text-muted-foreground">
                For media inquiries, contact <a href="mailto:media@ethiopianyouthleague.com" className="text-primary hover:underline">media@ethiopianyouthleague.com</a>
              </p>
            </div>
          </TabsContent>

          {/* Media Kit Tab */}
          <TabsContent value="media-kit">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {mediaKitItems.map((item, index) => (
                <div 
                  key={item.name}
                  className="glass-card p-6 flex items-center justify-between hover:border-primary/50 transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            {/* Usage Guidelines */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">Usage Guidelines</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• EYL logos and assets may only be used with prior written permission</p>
                <p>• Do not alter, distort, or recolor official logos</p>
                <p>• Always maintain clear space around logos as specified in brand guidelines</p>
                <p>• For commercial use, contact our partnership team for licensing</p>
                <p>• Photo credits must include "Ethiopian Youth League" or "EYL"</p>
              </div>
            </div>
          </TabsContent>

          {/* Press Contact Tab */}
          <TabsContent value="contact">
            {/* Social Media Links */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors ${social.color}`}
                  >
                    <social.icon className="h-6 w-6" />
                    <div>
                      <p className="font-medium">{social.name}</p>
                      <p className="text-sm text-muted-foreground">{social.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Press Contacts */}
            <div className="grid md:grid-cols-3 gap-6">
              {pressContacts.map((contact, index) => (
                <div 
                  key={contact.name}
                  className="glass-card p-6"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="font-bold mb-4">{contact.name}</h3>
                  <div className="space-y-3">
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </a>
                    <a 
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Press Accreditation */}
            <div className="glass-card p-6 mt-6 border-primary/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold mb-1">Press Accreditation</h3>
                  <p className="text-sm text-muted-foreground">
                    Journalists and photographers can apply for press passes to cover EYL events
                  </p>
                </div>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Apply for Accreditation
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}