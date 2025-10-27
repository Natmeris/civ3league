import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, ExternalLink, PlayCircle, Youtube, Twitch, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";

interface EventItem {
  id: number;
  title: string;
  date: string;
  status: "completed" | "ongoing" | "upcoming";
  description: string;
  winners: string;
  youtubeLink: string;
  twitchLink: string;
  participants: string;
  prize: string;
}

const Events = () => {
  useDocumentTitle("Civ 3 League - Events");

  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const parseEventEndDate = (dateStr: string): number => {
      if (!dateStr) return 0;
      // Split by en dash, em dash, or hyphen, take the last segment as the end date
      const parts = dateStr.split(/\s*[–—-]\s*/).map((p) => p.trim()).filter(Boolean);
      const endPart = parts.length > 1 ? parts[parts.length - 1] : parts[0];
      const t = Date.parse(endPart);
      return isNaN(t) ? 0 : t;
    };
    const load = async () => {
      try {
        // Add cache-busting timestamp to force fresh data
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/events.json?v=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error('Failed to fetch events');
        const json = await res.json();
        const sorted = Array.isArray(json)
          ? json.slice().sort((a: EventItem, b: EventItem) => parseEventEndDate(b.date) - parseEventEndDate(a.date))
          : [];
        if (!cancelled) setEvents(sorted);
      } catch (err) {
        console.error('Error loading events.json', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Trophy className="w-12 h-12 text-primary" />
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient drop-shadow-sm">
              Tournament Events
            </h1>
          </div>
          <p className="text-xl text-white leading-relaxed tracking-wide max-w-3xl mx-auto">
            Explore past and upcoming competitions in the CivPlayers Civ3 League
          </p>
        </div>

        {/* All Events */}
        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} className="gaming-card">
              <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-4 min-w-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl text-primary">{event.title}</CardTitle>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <p className="text-white leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-white">Winners</h3>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{event.winners}</p>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Participants</h3>
                    </div>
                    <p className="text-sm text-white">{event.participants} Players</p>
                  </div>
                  
                  {event.prize && (
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Prize</h3>
                      </div>
                      <p className="text-sm text-white">{event.prize}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {event.youtubeLink && event.youtubeLink !== "N/A" && (
                    <Button
                      variant="outline"
                      asChild
                      className="text-foreground hover:text-primary hover:bg-primary/10"
                      disabled={event.status === "completed"}
                      style={event.status === "completed" ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    >
                      <a href={event.youtubeLink} target="_blank" rel="noopener noreferrer">
                        Watch on YouTube
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  {event.twitchLink && event.twitchLink !== "N/A" && (
                    <Button
                      variant="outline"
                      asChild
                      className="text-foreground hover:text-primary hover:bg-primary/10"
                      disabled={event.status === "completed"}
                      style={event.status === "completed" ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    >
                      <a href={event.twitchLink} target="_blank" rel="noopener noreferrer">
                        Watch on Twitch
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  <Button variant="outline" asChild>
                    <Link to={`/events/${event.id}`}>
                      Event Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;