import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

type EventItem = {
  id: number;
  title: string;
  date?: string;
  status?: string;
  description?: string;
  youtubeLink?: string;
  twitchLink?: string;
};

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[] | null>(null);

  const getStatusBadge = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Upcoming</Badge>;
      case "ongoing":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Live</Badge>;
      default:
        return null;
    }
  };

  useEffect(() => {
    let aborted = false;
    const url = `${import.meta.env.BASE_URL}data/events.json`;
    fetch(url)
      .then((r) => r.json())
      .then((list: EventItem[]) => {
        if (aborted) return;
        // include both ongoing and upcoming events
        const parseStartDate = (dateStr?: string) => {
          if (!dateStr) return 0;
          const parts = dateStr.split(/\s*[–—-]\s*/).map((p) => p.trim()).filter(Boolean);
          const startPart = parts.length > 0 ? parts[0] : dateStr;
          const t = Date.parse(startPart);
          return isNaN(t) ? 0 : t;
        };

        const filtered = list.filter((e) => {
          const s = (e.status || "").toLowerCase();
          return s === "upcoming" || s === "ongoing";
        });

        // sort: ongoing first, then by start date (nearest first)
        filtered.sort((a, b) => {
          const sa = (a.status || "").toLowerCase();
          const sb = (b.status || "").toLowerCase();
          if (sa === "ongoing" && sb !== "ongoing") return -1;
          if (sb === "ongoing" && sa !== "ongoing") return 1;
          return parseStartDate(a.date) - parseStartDate(b.date);
        });

        setEvents(filtered.length ? filtered : []);
      })
      .catch(() => {
        if (aborted) return;
        setEvents([]);
      });
    return () => { aborted = true; };
  }, []);

  if (!events) return null; // not loaded yet
  if (events.length === 0) return null; // nothing to show

  return (
    <section className="container mx-auto px-4 mt-8 mb-8">
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming & Ongoing Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 rounded border border-border/50 bg-background/60 flex flex-col sm:flex-row justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-foreground">{ev.title}</div>
                    {getStatusBadge(ev.status)}
                  </div>
                  {ev.date && <div className="text-sm text-muted-foreground">{ev.date}</div>}
                  {ev.description && <div className="text-sm text-muted-foreground mt-2">{ev.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {ev.twitchLink && ev.twitchLink !== "N/A" && (
                    <Button asChild size="sm" variant="outline">
                      <a href={ev.twitchLink} target="_blank" rel="noopener noreferrer">Twitch <ExternalLink className="w-3 h-3 ml-1"/></a>
                    </Button>
                  )}
                  {ev.youtubeLink && ev.youtubeLink !== "N/A" && (
                    <Button asChild size="sm" className="ml-2">
                      <a href={ev.youtubeLink} target="_blank" rel="noopener noreferrer">YouTube <ExternalLink className="w-3 h-3 ml-1"/></a>
                    </Button>
                  )}
                    {/* Link to internal Event Details page */}
                    <Button variant="outline" asChild size="sm" className="ml-2">
                      <Link to={`/events/${ev.id}`}>
                        Event Details <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
