import { useDocumentTitle } from "@/lib/useDocumentTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Youtube, FileText, ExternalLink, Image as ImageIcon, Play } from "lucide-react";
import { useEffect, useState } from "react";

const Guides = () => {
  useDocumentTitle("Civ 3 League - Guides");
  type Video = { id: string; label: string };
  type SteamGuide = { url: string; label: string };
  type Tool = { url: string; label: string };
  type Image = { src: string; alt: string };
  type Guide = {
    id: string;
    title: string;
    description?: string;
    steamGuides?: SteamGuide[];
    videos?: Video[];
    tools?: Tool[];
    images?: Image[];
    note?: string;
  };

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Add cache-busting timestamp to force fresh data
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/guides.json?v=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error('Failed to fetch guides');
        const json = await res.json();
        if (!cancelled) {
          setGuides(json);
          setActiveTab(json[0]?.id || null);
        }
      } catch (err) {
        console.error('Error loading guides.json', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const activeGuide = (guides.find(g => g.id === activeTab) || guides[0] || {}) as Guide;

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Strategy Guides
            </h1>
          </div>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#fff' }}>
            Master Civ3 multiplayer with comprehensive guides, tutorials, and resources
          </p>
        </div>

        {/* Navigation Tabs */}
  <div className="flex flex-wrap justify-center gap-3 mb-8 min-w-0">
          {guides.map((guide) => (
            <Button
              key={guide.id}
              variant={activeTab === guide.id ? "default" : "outline"}
              onClick={() => setActiveTab(guide.id)}
              className={
                activeTab === guide.id 
                  ? "btn-hero text-foreground" 
                  : "text-foreground hover:text-primary"
              }
            >
              {guide.title}
            </Button>
          ))}
        </div>

        {/* Active Guide Content */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-3xl text-primary text-center">{activeGuide.title}</CardTitle>
            <p className="text-white leading-relaxed text-center text-lg">{activeGuide.description}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Video Tutorials */}
            {activeGuide.videos && activeGuide.videos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Youtube className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-semibold text-foreground">Video Tutorials</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGuide.videos.map((video, idx) => (
                    <Dialog key={idx}>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group border border-border/50 rounded-lg overflow-hidden bg-muted/20 hover:bg-muted/30 transition-all hover:scale-105">
                          <img 
                            src={getYouTubeThumbnail(video.id)} 
                            alt={video.label}
                            className="w-full aspect-video object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                            <div className="bg-red-500 rounded-full p-4 group-hover:scale-110 transition-transform">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                          </div>
                          <div className="p-3 border-t border-border/50 bg-background/80">
                            <p className="text-sm font-medium text-white">{video.label}</p>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full">
                        <DialogHeader>
                          <DialogTitle>{video.label}</DialogTitle>
                        </DialogHeader>
                        <div className="aspect-video w-full">
                          <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(video.id)}
                            title={video.label}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            )}

            {/* Steam Guides */}
            {activeGuide.steamGuides && activeGuide.steamGuides.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-foreground">Written Guides</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGuide.steamGuides.map((guide, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500 h-auto py-4 justify-start"
                      asChild
                    >
                      <a href={guide.url} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="text-left text-white">{guide.label}</span>
                        <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            {activeGuide.tools && activeGuide.tools.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold text-foreground">Interactive Tools</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {activeGuide.tools.map((tool, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500 h-auto py-4 justify-start"
                      asChild
                    >
                      <a href={tool.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="text-left text-white">{tool.label}</span>
                        <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {activeGuide.note && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-sm text-white italic text-center">{activeGuide.note}</p>
              </div>
            )}

            {/* Images */}
            {activeGuide.images && activeGuide.images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">Visual Guides</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeGuide.images.map((image, idx) => {
                    // Support both local paths and full URLs
                    const imgSrc = image.src.startsWith('http') ? image.src : `${import.meta.env.BASE_URL}${image.src.startsWith('/') ? image.src.slice(1) : image.src}`;
                    return (
                    <Dialog key={idx}>
                      <DialogTrigger asChild>
                        <div className="border border-border/50 rounded-lg overflow-hidden bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer hover:scale-105">
                          <img 
                            src={imgSrc} 
                            alt={image.alt}
                            className="w-full h-auto hover:opacity-90 transition-opacity"
                          />
                          <div className="p-3 border-t border-border/50">
                            <p className="text-sm text-white text-center">{image.alt}</p>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl w-full">
                        <DialogHeader>
                          <DialogTitle>{image.alt}</DialogTitle>
                        </DialogHeader>
                        <div className="w-full">
                          <img 
                            src={imgSrc} 
                            alt={image.alt}
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="gaming-card mt-12">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Need More Help?</h2>
            <p className="text-white mb-6 max-w-2xl mx-auto leading-relaxed">
              Join our Discord community to ask questions, share strategies, and connect with experienced players who can help you improve your game.
            </p>
            <Button asChild className="btn-hero">
              <a href="https://discord.gg/teVt5pt" target="_blank" rel="noopener noreferrer">
                Join Discord Community
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Guides;