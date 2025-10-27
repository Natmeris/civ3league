import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, ChevronLeft, ExternalLink } from "lucide-react";

type EventItem = {
  id: number;
  title: string;
  date: string;
  status: "completed" | "ongoing" | "upcoming" | string;
  description?: string;
  longDescription?: string;
  winners?: string;
  youtubeLink?: string;
  twitchLink?: string;
  participants?: string;
  prize?: string;
  bracket?: {
    rounds: Array<{
      name: string;
      matches: Array<{ p1: string; p2: string; winner?: "p1" | "p2"; score?: string }>;
    }>;
  };
};

const statusBadge = (status?: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
    case "upcoming":
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Upcoming</Badge>;
    case "ongoing":
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Live</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  useDocumentTitle(event ? `${event.title} - Event` : "Event - Civ 3 League");

  // Resolve a URL that might be relative to the site base path (GitHub Pages basename)
  const resolveUrl = (u: string): string => {
    if (!u) return u;
    const url = String(u).trim();
    if (/^https?:\/\//i.test(url)) return url; // absolute http(s)
    if (url.startsWith("/")) return url; // already absolute path
    // treat as relative to BASE_URL (public/ root)
    const cleaned = url.replace(/^\.\/?/, "");
    return `${import.meta.env.BASE_URL}${cleaned}`;
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Add cache-busting timestamp to force fresh data
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/events.json?v=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to fetch events");
        const json: EventItem[] = await res.json();
        if (cancelled) return;
        const found = json.find((e) => String(e.id) === String(id));
        if (found) setEvent(found);
      } catch (err) {
        console.error("Error loading event", err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const title = event?.title || "Event";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-6">
              <Button variant="outline" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
            <Link to="/events">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to Events
            </Link>
          </Button>
        </div>

        {event ? (
          <div className="space-y-6">
            {/* Hero */}
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-4 mb-3">
                <Trophy className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient drop-shadow-sm">
                  {title}
                </h1>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-white">
                <Calendar className="w-4 h-4" />
                <span>{event.date}</span>
                {statusBadge(event.status)}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Winners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white leading-relaxed">{event.winners || "TBD"}</p>
                </CardContent>
              </Card>
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{event.participants || "—"} Players</p>
                </CardContent>
              </Card>
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Prize</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{event.prize || "—"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {/* Ordered Content Blocks (preferred) inside a Card */}
            {Array.isArray((event as any).content) && (event as any).content.length > 0 ? (
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-foreground/90 text-base md:text-lg leading-relaxed">
                    {(event as any).content.map((block: any, idx: number) => {
                      if (!block || !block.type) return null;
                      switch (block.type) {
                        case "paragraph": {
                          const text = String(block.text || "").trim();
                          if (!text) return null;
                          return (
                            <p key={idx} className="whitespace-pre-wrap leading-relaxed text-base md:text-lg">{text}</p>
                          );
                        }
                        case "image": {
                          const src = resolveUrl(String(block.src || "").trim());
                          if (!src) return null;
                          return (
                            <figure key={idx} className="flex flex-col items-center gap-2">
                              <img
                                src={src}
                                alt={block.alt || "Event image"}
                                className="max-h-[400px] rounded border border-border shadow"
                                loading="lazy"
                              />
                              {block.alt ? (
                                <figcaption className="text-xs text-muted-foreground">{block.alt}</figcaption>
                              ) : null}
                            </figure>
                          );
                        }
                        case "link": {
                          const url = resolveUrl(String(block.url || "").trim());
                          if (!url) return null;
                          const label = String(block.label || url);
                          return (
                            <p key={idx}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                {label}
                              </a>
                            </p>
                          );
                        }
                        default:
                          return null;
                      }
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Fallback: Overview in Card */}
                {event.description && event.description !== "N/A" && (
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-foreground">Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white leading-relaxed whitespace-pre-wrap text-base md:text-lg">{event.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Fallback: Details in Card */}
                {event.longDescription && event.longDescription !== "N/A" && (
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-foreground">Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none text-base md:text-lg">
                        {event.longDescription
                          .split(/\n\s*\n/)
                          .map((para, idx) => (
                            <p key={idx} className="text-white leading-relaxed whitespace-pre-wrap text-base md:text-lg">{para}</p>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Bracket */}
            {event.bracket?.rounds?.length ? (
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Tournament Bracket</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <div className="flex gap-12 min-w-max pb-4">
                      {event.bracket.rounds.map((round, ri) => {
                        const hasNextRound = ri < event.bracket!.rounds.length - 1;
                        const isGrandFinalRound = ri === event.bracket!.rounds.length - 1 && round.matches.length === 1;
                        
                        return (
                          <div key={ri} className="flex flex-col relative" style={{ minWidth: '250px' }}>
                            {/* Round Header */}
                            <div className="mb-6 text-center">
                              <h3 className="font-bold text-xl text-primary mb-1">{round.name}</h3>
                              <p className="text-xs text-white">
                                {round.matches.length} {round.matches.length === 1 ? 'Match' : 'Matches'}
                              </p>
                            </div>
                            
                            {/* Matches Container with SVG Overlay */}
                            <div className="flex flex-col justify-around flex-1 gap-4 relative">
                              {/* SVG Layer for Connector Lines */}
                              {hasNextRound && (
                                <svg 
                                  className="absolute inset-0 pointer-events-none"
                                  style={{ width: 'calc(100% + 48px)', height: '100%', left: '100%' }}
                                >
                                  {round.matches.map((_, mi) => {
                                    if (mi % 2 === 1) return null; // Only draw from even matches (pairs)
                                    
                                    const matchesInRound = round.matches.length;
                                    const nextRoundMatches = event.bracket!.rounds[ri + 1].matches.length;
                                    
                                    // Calculate positions as percentages
                                    const match1Pos = ((mi + 0.5) / matchesInRound) * 100;
                                    const match2Pos = mi + 1 < matchesInRound ? ((mi + 1.5) / matchesInRound) * 100 : match1Pos;
                                    const nextMatchPos = ((Math.floor(mi / 2) + 0.5) / nextRoundMatches) * 100;
                                    
                                    return (
                                      <g key={mi}>
                                        {/* Horizontal line from first match */}
                                        <line
                                          x1="0"
                                          y1={`${match1Pos}%`}
                                          x2="24"
                                          y2={`${match1Pos}%`}
                                          stroke="hsl(var(--primary))"
                                          strokeWidth="2.5"
                                          opacity="0.6"
                                        />
                                        
                                        {/* Horizontal line from second match (if exists) */}
                                        {mi + 1 < matchesInRound && (
                                          <line
                                            x1="0"
                                            y1={`${match2Pos}%`}
                                            x2="24"
                                            y2={`${match2Pos}%`}
                                            stroke="hsl(var(--primary))"
                                            strokeWidth="2.5"
                                            opacity="0.6"
                                          />
                                        )}
                                        
                                        {/* Vertical connecting line */}
                                        <line
                                          x1="24"
                                          y1={`${match1Pos}%`}
                                          x2="24"
                                          y2={`${mi + 1 < matchesInRound ? match2Pos : match1Pos}%`}
                                          stroke="hsl(var(--primary))"
                                          strokeWidth="2.5"
                                          opacity="0.6"
                                        />
                                        
                                        {/* Horizontal line to next round */}
                                        <line
                                          x1="24"
                                          y1={`${(match1Pos + (mi + 1 < matchesInRound ? match2Pos : match1Pos)) / 2}%`}
                                          x2="48"
                                          y2={`${(match1Pos + (mi + 1 < matchesInRound ? match2Pos : match1Pos)) / 2}%`}
                                          stroke="hsl(var(--primary))"
                                          strokeWidth="2.5"
                                          opacity="0.6"
                                        />
                                      </g>
                                    );
                                  })}
                                </svg>
                              )}
                              
                              {round.matches.map((match, mi) => (
                                <div key={mi} className="relative z-10">
                                  {/* Match Card */}
                                  <div className="bg-muted/20 border-2 border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                                  {/* Match Header */}
                                  <div className="bg-muted/40 px-3 py-1.5 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-semibold text-white">
                                      Match {mi + 1}
                                    </span>
                                    {match.score && (
                                      <Badge className="bg-primary/20 text-primary border-primary/40 text-xs px-2 py-0">
                                        {match.score}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Players */}
                                  <div className="p-2 space-y-1">
                                    {/* Player 1 */}
                                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded transition-all ${
                                      match.winner === "p1"
                                        ? "bg-primary/30 border-2 border-primary/60 shadow-lg shadow-primary/20"
                                        : "bg-background/80 border border-border/50"
                                    }`}>
                                        {isGrandFinalRound && match.winner === "p1" && (
                                          <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                                        )}
                                      <span className={`text-sm flex-1 ${
                                        match.winner === "p1"
                                          ? "font-bold text-primary"
                                          : "font-medium text-foreground"
                                      }`}>
                                        {match.p1}
                                      </span>
                                    </div>
                                    
                                    {/* Player 2 */}
                                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded transition-all ${
                                      match.winner === "p2"
                                        ? "bg-primary/30 border-2 border-primary/60 shadow-lg shadow-primary/20"
                                        : "bg-background/80 border border-border/50"
                                    }`}>
                                      {isGrandFinalRound && match.winner === "p2" && (
                                        <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                                      )}
                                      <span className={`text-sm flex-1 ${
                                        match.winner === "p2"
                                          ? "font-bold text-primary"
                                          : "font-medium text-foreground"
                                      }`}>
                                        {match.p2}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                  
                  {/* Bracket Legend */}
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-center gap-6 text-xs text-white">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span>Winner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-primary/30 border border-primary/60"></div>
                        <span>Winner Highlight</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Tournament Bracket</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white text-center py-8">
                    Bracket not available for this event.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {/* YouTube Button */}
              {event.youtubeLink && event.youtubeLink !== "N/A" && (
                <Button
                  variant="default"
                  asChild
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <a href={event.youtubeLink} target="_blank" rel="noopener noreferrer">
                    Watch on YouTube
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
              {/* Twitch Button */}
              {event.twitchLink && event.twitchLink !== "N/A" && (
                <Button
                  variant="default"
                  asChild
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <a href={event.twitchLink} target="_blank" rel="noopener noreferrer">
                    Watch on Twitch
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
              {/* Discord Button */}
              <Button
                variant="outline"
                asChild
                className="text-foreground hover:text-primary hover:bg-primary/10"
              >
                <a href="https://discord.gg/teVt5pt" target="_blank" rel="noopener noreferrer">
                  Join Discord
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              {/* Steam Button */}
              <Button
                variant="outline"
                asChild
                className="text-foreground hover:text-primary hover:bg-primary/10"
              >
                <a href="https://steamcommunity.com/groups/CivPlayersCiv3" target="_blank" rel="noopener noreferrer">
                  Join Steam
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-white">Loading...</p>
        )}
      </main>
      <Footer />
    </div>
  );
}