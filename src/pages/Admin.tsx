import { useEffect, useState } from "react";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  RefreshCw, 
  Save, 
  Plus, 
  Trash2, 
  Shield,
  Calendar,
  BookOpen,
  Radio,
  AlertCircle
} from "lucide-react";

const DATA_KEYS = ["rules", "events", "guides", "stream"] as const;
type DataKey = (typeof DATA_KEYS)[number];

type RuleCategory = { icon: string; title: string; rules: string[] };
type EventItem = {
  id: number;
  title: string;
  date: string;
  status: string;
  description?: string;
  longDescription?: string;
  winners?: string;
  youtubeLink?: string;
  twitchLink?: string;
  participants?: string;
  prize?: string;
  // Ordered rich content blocks for event details rendering
  content?: Array<
    | { type: "paragraph"; text: string }
    | { type: "image"; src: string; alt?: string }
    | { type: "link"; url: string; label?: string }
  >;
  bracket?: {
    rounds: Array<{
      name: string;
      matches: Array<{ p1: string; p2: string; winner?: "p1" | "p2"; score?: string }>;
    }>;
  };
};
type GuideItem = {
  id: string;
  title: string;
  description?: string;
  steamGuides?: { url: string; label?: string }[];
  videos?: { id: string; label?: string }[];
  tools?: { url: string; label?: string }[];
  images?: { src: string; alt?: string }[];
  note?: string;
};
type StreamData = {
  twitch: { name: string; username: string; url: string }[];
  youtube: { name: string; channelId: string; url: string }[];
};

const Admin = () => {
  useDocumentTitle("Admin - Civ 3 League");
  const [active, setActive] = useState<DataKey>("rules");
  const [status, setStatus] = useState<string | null>(null);
  const [rulesStructured, setRulesStructured] = useState<RuleCategory[] | null>(null);
  const [eventsStructured, setEventsStructured] = useState<EventItem[] | null>(null);
  const [guidesStructured, setGuidesStructured] = useState<GuideItem[] | null>(null);
  const [streamStructured, setStreamStructured] = useState<StreamData | null>(null);
  const [bracketGenPlayers, setBracketGenPlayers] = useState<Record<number, number>>({});

  const load = async (key: DataKey) => {
    setStatus("Loading...");
    try {
      // Add cache-busting timestamp to force fresh data
      const res = await fetch(
        `${import.meta.env.BASE_URL}data/${key}.json?v=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Failed to load /data/${key}.json`);
      const json = await res.json();
      if (key === "rules") setRulesStructured(Array.isArray(json) ? json : []);
      if (key === "events") setEventsStructured(Array.isArray(json) ? json : []);
      if (key === "guides") setGuidesStructured(Array.isArray(json) ? json : []);
      if (key === "stream") setStreamStructured(json as StreamData);
      setStatus("✓ Loaded successfully");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setStatus("✗ Error: " + message);
    }
  };

  useEffect(() => {
    load(active);
  }, [active]);

  const getActiveBody = () => {
    switch (active) {
      case "rules":
        return (rulesStructured ?? []) as unknown;
      case "events":
        return (eventsStructured ?? []) as unknown;
      case "guides":
        return (guidesStructured ?? []) as unknown;
      case "stream":
        return (streamStructured ?? { twitch: [], youtube: [] }) as unknown;
      default:
        return {} as unknown;
    }
  };

  const save = () => {
    const body = getActiveBody();
    const payload = typeof body === "string" ? body : JSON.stringify(body, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("✓ Downloaded — Replace file in public/data/ and commit");
  };

  const getIcon = (key: DataKey) => {
    switch (key) {
      case "rules": return Shield;
      case "events": return Calendar;
      case "guides": return BookOpen;
      case "stream": return Radio;
    }
  };

  const generateBracket = (eventId: number) => {
    const numPlayers = bracketGenPlayers[eventId] || 8;
    if (numPlayers < 2 || numPlayers > 64) {
      setStatus("✗ Player count must be between 2 and 64");
      return;
    }
    if (!Number.isInteger(Math.log2(numPlayers))) {
      setStatus("✗ Player count must be a power of 2 (2, 4, 8, 16, 32, 64)");
      return;
    }

    const rounds: Array<{ name: string; matches: Array<{ p1: string; p2: string }> }> = [];
    let currentPlayers = numPlayers;
    let roundNum = 1;

    while (currentPlayers > 1) {
      const matchesInRound = currentPlayers / 2;
      const roundName =
        currentPlayers === 2
          ? "Finals"
          : currentPlayers === 4
          ? "Semi-Finals"
          : currentPlayers === 8
          ? "Quarter-Finals"
          : `Round ${roundNum}`;

      const matches = Array.from({ length: matchesInRound }, (_, i) => ({
        p1: `Player ${i * 2 + 1}`,
        p2: `Player ${i * 2 + 2}`,
      }));

      rounds.push({ name: roundName, matches });
      currentPlayers /= 2;
      roundNum++;
    }

    const copy = (eventsStructured || []).slice();
    const idx = copy.findIndex((e) => e.id === eventId);
    if (idx >= 0) {
      copy[idx] = { ...copy[idx], bracket: { rounds } };
      setEventsStructured(copy);
      setStatus("✓ Bracket generated successfully");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Settings className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
              Admin Panel
            </h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground px-4">
            Manage site content and configuration
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
          {DATA_KEYS.map((k) => {
            const Icon = getIcon(k);
            return (
              <Button
                key={k}
                variant={k === active ? "default" : "outline"}
                onClick={() => setActive(k)}
                size="sm"
                className={
                  k === active 
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "text-foreground hover:text-primary hover:bg-primary/10"
                }
              >
                <Icon className="w-4 h-4 mr-1 md:mr-2" />
                <span className="capitalize text-sm md:text-base">{k}</span>
              </Button>
            );
          })}
        </div>

        {/* Action Bar */}
        <Card className="gaming-card mb-4 md:mb-6">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-2 text-xs md:text-sm">
                {status && (
                  <Badge variant={status.startsWith("✓") ? "default" : "destructive"} className="text-white text-xs">
                    {status}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => load(active)} 
                  size="sm"
                  className="flex-1 sm:flex-none text-foreground hover:text-primary text-xs md:text-sm"
                >
                  <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Reload
                </Button>
                <Button 
                  onClick={save} 
                  size="sm"
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white text-xs md:text-sm"
                >
                  <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <div>
          {active === "rules" && (
            <div className="space-y-4 md:space-y-6">
              {(rulesStructured || []).map((cat, ci) => (
                <Card key={ci} className="gaming-card">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                      <input
                        className="w-full sm:w-24 md:w-32 p-2 border border-border rounded bg-background text-foreground text-sm"
                        placeholder="Icon"
                        value={cat.icon}
                        onChange={(e) => {
                          const copy = (rulesStructured || []).slice();
                          copy[ci] = { ...copy[ci], icon: e.target.value };
                          setRulesStructured(copy);
                        }}
                      />
                      <input
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground font-semibold text-base md:text-lg"
                        placeholder="Category Title"
                        value={cat.title}
                        onChange={(e) => {
                          const copy = (rulesStructured || []).slice();
                          copy[ci] = { ...copy[ci], title: e.target.value };
                          setRulesStructured(copy);
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const copy = (rulesStructured || []).slice();
                          copy.splice(ci, 1);
                          setRulesStructured(copy);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-xs md:text-sm"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-3">
                    {(cat.rules || []).map((r, ri) => (
                      <div key={ri} className="flex gap-2 items-start">
                        <Badge variant="outline" className="mt-2 flex-shrink-0 text-foreground text-xs">
                          {ri + 1}
                        </Badge>
                        <textarea
                          className="flex-1 p-2 md:p-3 border border-border rounded bg-background text-foreground min-h-[80px] text-sm md:text-base"
                          placeholder="Rule description..."
                          value={r}
                          onChange={(e) => {
                            const copy = (rulesStructured || []).slice();
                            copy[ci].rules[ri] = e.target.value;
                            setRulesStructured(copy);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const copy = (rulesStructured || []).slice();
                            copy[ci].rules.splice(ri, 1);
                            setRulesStructured(copy);
                          }}
                          className="hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const copy = (rulesStructured || []).slice();
                        copy[ci].rules.push("New rule");
                        setRulesStructured(copy);
                      }}
                      className="text-foreground hover:text-primary hover:bg-primary/10 text-xs md:text-sm"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Add Rule
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={() => {
                  const copy = (rulesStructured || []).slice();
                  copy.push({ icon: "Shield", title: "New Category", rules: ["New rule"] });
                  setRulesStructured(copy);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white text-sm md:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Category
              </Button>
            </div>
          )}

          {active === "events" && (
            <div className="space-y-4 md:space-y-6">
              {(eventsStructured || []).map((ev, ei) => (
                <Card key={ev.id ?? ei} className="gaming-card">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <CardTitle className="text-lg md:text-xl text-foreground">Event #{ev.id}</CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const copy = (eventsStructured || []).slice();
                          copy.splice(ei, 1);
                          setEventsStructured(copy);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-xs md:text-sm"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          Title
                        </label>
                        <input
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.title}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], title: e.target.value };
                            setEventsStructured(copy);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          Date
                        </label>
                        <input
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.date}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], date: e.target.value };
                            setEventsStructured(copy);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          Status
                        </label>
                        <select
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.status}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], status: e.target.value };
                            setEventsStructured(copy);
                          }}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          Winners
                        </label>
                        <input
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.winners || ""}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], winners: e.target.value };
                            setEventsStructured(copy);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          Participants
                        </label>
                        <input
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.participants || ""}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], participants: e.target.value };
                            setEventsStructured(copy);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          Prize
                        </label>
                        <input
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.prize || ""}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], prize: e.target.value };
                            setEventsStructured(copy);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        className="w-full p-2 md:p-3 border border-border rounded bg-background text-foreground min-h-[80px] text-sm md:text-base"
                        value={ev.description || ""}
                        onChange={(e) => {
                          const copy = (eventsStructured || []).slice();
                          copy[ei] = { ...copy[ei], description: e.target.value };
                          setEventsStructured(copy);
                        }}
                      />
                    </div>

                    {/* Legacy Long Description management (no separate editor) */}
                    {(ev.longDescription && ev.longDescription !== "N/A") && (
                      <div className="border border-amber-500/30 bg-amber-500/5 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs md:text-sm font-medium text-foreground">
                            Legacy Long Description detected
                          </label>
                          <div className="flex gap-2">
                            {/* Convert only if no ordered content exists yet */}
                            {(!ev.content || ev.content.length === 0) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const copy = (eventsStructured || []).slice();
                                  const raw = (copy[ei].longDescription || "").trim();
                                  const blocks = raw
                                    .split(/\n\s*\n/)
                                    .map((p) => p.trim())
                                    .filter(Boolean)
                                    .map((text) => ({ type: "paragraph" as const, text }));
                                  copy[ei] = { ...copy[ei], content: blocks };
                                  setEventsStructured(copy);
                                  setStatus("✓ Converted legacy long description into ordered blocks");
                                }}
                                className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                              >
                                Convert to blocks
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const copy = (eventsStructured || []).slice();
                                copy[ei] = { ...copy[ei], longDescription: "" };
                                setEventsStructured(copy);
                                setStatus("✓ Removed legacy long description");
                              }}
                              className="text-white bg-red-600 hover:bg-red-700 text-xs"
                            >
                              Remove legacy text
                            </Button>
                          </div>
                        </div>
                        <div className="max-h-40 overflow-auto text-xs md:text-sm whitespace-pre-wrap text-foreground/90 border border-border/50 rounded p-2 bg-background">
                          {ev.longDescription}
                        </div>
                      </div>
                    )}

                    {/* Ordered Details Content Blocks */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs md:text-sm font-medium text-foreground">Event Details (ordered blocks)</label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const copy = (eventsStructured || []).slice();
                              const list = copy[ei].content ? copy[ei].content.slice() : [];
                              list.push({ type: "paragraph", text: "" });
                              copy[ei] = { ...copy[ei], content: list };
                              setEventsStructured(copy);
                            }}
                            className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Paragraph
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const copy = (eventsStructured || []).slice();
                              const list = copy[ei].content ? copy[ei].content.slice() : [];
                              list.push({ type: "image", src: "", alt: "" });
                              copy[ei] = { ...copy[ei], content: list };
                              setEventsStructured(copy);
                            }}
                            className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Image
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const copy = (eventsStructured || []).slice();
                              const list = copy[ei].content ? copy[ei].content.slice() : [];
                              list.push({ type: "link", url: "", label: "" });
                              copy[ei] = { ...copy[ei], content: list };
                              setEventsStructured(copy);
                            }}
                            className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Link
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(ev.content || []).map((block, bi) => (
                          <div key={bi} className="p-3 border border-border rounded bg-muted/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{bi + 1}</Badge>
                                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {block.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const copy = (eventsStructured || []).slice();
                                    const list = (copy[ei].content || []).slice();
                                    if (bi > 0) {
                                      const tmp = list[bi - 1];
                                      list[bi - 1] = list[bi];
                                      list[bi] = tmp;
                                      copy[ei] = { ...copy[ei], content: list };
                                      setEventsStructured(copy);
                                    }
                                  }}
                                  className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const copy = (eventsStructured || []).slice();
                                    const list = (copy[ei].content || []).slice();
                                    if (bi < list.length - 1) {
                                      const tmp = list[bi + 1];
                                      list[bi + 1] = list[bi];
                                      list[bi] = tmp;
                                      copy[ei] = { ...copy[ei], content: list };
                                      setEventsStructured(copy);
                                    }
                                  }}
                                  className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const copy = (eventsStructured || []).slice();
                                    const list = (copy[ei].content || []).slice();
                                    list.splice(bi, 1);
                                    copy[ei] = { ...copy[ei], content: list };
                                    setEventsStructured(copy);
                                  }}
                                  className="hover:bg-red-500/10 text-xs"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              </div>
                            </div>

                            {block.type === "paragraph" && (
                              <textarea
                                className="w-full p-2 border border-border rounded bg-background text-foreground min-h-[80px] text-sm"
                                placeholder="Paragraph text…"
                                value={block.text}
                                onChange={(e) => {
                                  const copy = (eventsStructured || []).slice();
                                  const list = (copy[ei].content || []).slice();
                                  list[bi] = { ...(list[bi] as any), text: e.target.value };
                                  copy[ei] = { ...copy[ei], content: list };
                                  setEventsStructured(copy);
                                }}
                              />
                            )}
                            {block.type === "image" && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                  placeholder="Image path or URL"
                                  value={block.src}
                                  onChange={(e) => {
                                    const copy = (eventsStructured || []).slice();
                                    const list = (copy[ei].content || []).slice();
                                    list[bi] = { ...(list[bi] as any), src: e.target.value };
                                    copy[ei] = { ...copy[ei], content: list };
                                    setEventsStructured(copy);
                                  }}
                                />
                                <input
                                  className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                  placeholder="Alt text (optional)"
                                  value={(block as any).alt || ""}
                                  onChange={(e) => {
                                    const copy = (eventsStructured || []).slice();
                                    const list = (copy[ei].content || []).slice();
                                    list[bi] = { ...(list[bi] as any), alt: e.target.value };
                                    copy[ei] = { ...copy[ei], content: list };
                                    setEventsStructured(copy);
                                  }}
                                />
                              </div>
                            )}
                            {block.type === "link" && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                  placeholder="Label (optional)"
                                  value={(block as any).label || ""}
                                  onChange={(e) => {
                                    const copy = (eventsStructured || []).slice();
                                    const list = (copy[ei].content || []).slice();
                                    list[bi] = { ...(list[bi] as any), label: e.target.value };
                                    copy[ei] = { ...copy[ei], content: list };
                                    setEventsStructured(copy);
                                  }}
                                />
                                <input
                                  className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                  placeholder="URL"
                                  value={(block as any).url}
                                  onChange={(e) => {
                                    const copy = (eventsStructured || []).slice();
                                    const list = (copy[ei].content || []).slice();
                                    list[bi] = { ...(list[bi] as any), url: e.target.value };
                                    copy[ei] = { ...copy[ei], content: list };
                                    setEventsStructured(copy);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          YouTube Link
                        </label>
                        <input
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.youtubeLink || ""}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], youtubeLink: e.target.value };
                            setEventsStructured(copy);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                          Twitch Link
                        </label>
                        <input
                          className="w-full p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          value={ev.twitchLink || ""}
                          onChange={(e) => {
                            const copy = (eventsStructured || []).slice();
                            copy[ei] = { ...copy[ei], twitchLink: e.target.value };
                            setEventsStructured(copy);
                          }}
                        />
                      </div>
                    </div>

                    {/* Bracket Generator */}
                    <div className="border-t border-border pt-4">
                      <label className="block text-xs md:text-sm font-medium text-foreground mb-3">
                        Tournament Bracket Generator
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="number"
                          className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                          placeholder="Number of players (2, 4, 8, 16, 32, 64)"
                          value={bracketGenPlayers[ev.id] || ""}
                          onChange={(e) => {
                            setBracketGenPlayers({
                              ...bracketGenPlayers,
                              [ev.id]: parseInt(e.target.value) || 0,
                            });
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateBracket(ev.id)}
                          className="text-foreground hover:text-primary hover:bg-primary/10 w-full sm:w-auto text-xs md:text-sm"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Generate Bracket
                        </Button>
                      </div>
                      {ev.bracket && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {ev.bracket.rounds.length} rounds configured
                        </Badge>
                      )}
                    </div>

                    {/* Bracket Editor */}
                    {ev.bracket?.rounds && (
                      <div className="border-t border-border pt-4 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs md:text-sm font-medium text-foreground">
                            Bracket Rounds
                          </label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const copy = (eventsStructured || []).slice();
                                copy[ei].bracket!.rounds.push({ name: `Round ${copy[ei].bracket!.rounds.length + 1}`, matches: [] });
                                setEventsStructured(copy);
                              }}
                              className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Round
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const copy = (eventsStructured || []).slice();
                                delete copy[ei].bracket;
                                setEventsStructured(copy);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove Bracket
                            </Button>
                          </div>
                        </div>
                        {ev.bracket.rounds.map((round, ri) => (
                          <Card key={ri} className="bg-muted/20 border border-border">
                            <CardHeader className="p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <input
                                className="w-full md:w-auto p-2 border border-border rounded bg-background text-foreground font-semibold text-sm md:text-base"
                                value={round.name}
                                onChange={(e) => {
                                  const copy = (eventsStructured || []).slice();
                                  copy[ei].bracket!.rounds[ri].name = e.target.value;
                                  setEventsStructured(copy);
                                }}
                              />
                              <div className="flex gap-2 mt-2 md:mt-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const copy = (eventsStructured || []).slice();
                                    copy[ei].bracket!.rounds[ri].matches.push({ p1: '', p2: '' });
                                    setEventsStructured(copy);
                                  }}
                                  className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Match
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const copy = (eventsStructured || []).slice();
                                    copy[ei].bracket!.rounds.splice(ri, 1);
                                    setEventsStructured(copy);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Remove Round
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 space-y-2">
                              {round.matches.map((match, mi) => (
                                <div key={mi} className="bg-background/50 p-2 md:p-3 rounded border border-border/50 space-y-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-xs">Match {mi + 1}</Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const copy = (eventsStructured || []).slice();
                                        copy[ei].bracket!.rounds[ri].matches.splice(mi, 1);
                                        setEventsStructured(copy);
                                      }}
                                      className="hover:bg-red-500/10 text-xs"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </Button>
                                    {match.score && (
                                      <Badge className="bg-primary/20 text-primary text-xs">{match.score}</Badge>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                      placeholder="Player 1"
                                      value={match.p1}
                                      onChange={(e) => {
                                        const copy = (eventsStructured || []).slice();
                                        copy[ei].bracket!.rounds[ri].matches[mi].p1 = e.target.value;
                                        setEventsStructured(copy);
                                      }}
                                    />
                                    <input
                                      className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                      placeholder="Player 2"
                                      value={match.p2}
                                      onChange={(e) => {
                                        const copy = (eventsStructured || []).slice();
                                        copy[ei].bracket!.rounds[ri].matches[mi].p2 = e.target.value;
                                        setEventsStructured(copy);
                                      }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <select
                                      className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                      value={match.winner || ""}
                                      onChange={(e) => {
                                        const copy = (eventsStructured || []).slice();
                                        const val = e.target.value;
                                        if (val === "") {
                                          delete copy[ei].bracket!.rounds[ri].matches[mi].winner;
                                        } else {
                                          copy[ei].bracket!.rounds[ri].matches[mi].winner = val as "p1" | "p2";
                                        }
                                        setEventsStructured(copy);
                                      }}
                                    >
                                      <option value="">No winner yet</option>
                                      <option value="p1">Player 1 wins</option>
                                      <option value="p2">Player 2 wins</option>
                                    </select>
                                    <input
                                      className="p-2 border border-border rounded bg-background text-foreground text-sm"
                                      placeholder="Score (e.g., 3-1)"
                                      value={match.score || ""}
                                      onChange={(e) => {
                                        const copy = (eventsStructured || []).slice();
                                        copy[ei].bracket!.rounds[ri].matches[mi].score = e.target.value;
                                        setEventsStructured(copy);
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={() => {
                  const copy = (eventsStructured || []).slice();
                  const maxId = copy.reduce((max, e) => Math.max(max, e.id), 0);
                  copy.push({
                    id: maxId + 1,
                    title: "New Event",
                    date: "TBD",
                    status: "upcoming",
                    description: "",
                    winners: "",
                    participants: "",
                    prize: "",
                  });
                  setEventsStructured(copy);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white text-sm md:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Event
              </Button>
            </div>
          )}

          {active === "guides" && (
            <div className="space-y-4 md:space-y-6">
              {(guidesStructured || []).map((guide, gi) => (
                <Card key={guide.id} className="gaming-card">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                        <input
                          className="w-full sm:w-28 md:w-32 p-2 border border-border rounded bg-background text-foreground font-mono text-sm"
                          placeholder="ID (e.g., qc)"
                          value={guide.id}
                          onChange={(e) => {
                            const copy = (guidesStructured || []).slice();
                            copy[gi] = { ...copy[gi], id: e.target.value };
                            setGuidesStructured(copy);
                          }}
                        />
                        <input
                          className="flex-1 p-2 border border-border rounded bg-background text-foreground font-semibold text-sm md:text-base"
                          placeholder="Title"
                          value={guide.title}
                          onChange={(e) => {
                            const copy = (guidesStructured || []).slice();
                            copy[gi] = { ...copy[gi], title: e.target.value };
                            setGuidesStructured(copy);
                          }}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const copy = (guidesStructured || []).slice();
                          copy.splice(gi, 1);
                          setGuidesStructured(copy);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-xs md:text-sm"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        className="w-full p-2 border border-border rounded bg-background text-foreground min-h-[60px] text-sm md:text-base"
                        value={guide.description || ""}
                        onChange={(e) => {
                          const copy = (guidesStructured || []).slice();
                          copy[gi] = { ...copy[gi], description: e.target.value };
                          setGuidesStructured(copy);
                        }}
                      />
                    </div>

                    {/* Steam Guides */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs md:text-sm font-medium text-foreground">Steam Guides</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const copy = (guidesStructured || []).slice();
                            if (!copy[gi].steamGuides) copy[gi].steamGuides = [];
                            copy[gi].steamGuides!.push({ url: "", label: "" });
                            setGuidesStructured(copy);
                          }}
                          className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {(guide.steamGuides || []).map((sg, sgi) => (
                        <div key={sgi} className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                            placeholder="Label"
                            value={sg.label || ""}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].steamGuides![sgi] = { ...sg, label: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <input
                            className="flex-[2] p-2 border border-border rounded bg-background text-foreground text-sm"
                            placeholder="URL"
                            value={sg.url}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].steamGuides![sgi] = { ...sg, url: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].steamGuides!.splice(sgi, 1);
                              setGuidesStructured(copy);
                            }}
                            className="hover:bg-red-500/10 w-full sm:w-auto"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Videos */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs md:text-sm font-medium text-foreground">YouTube Videos</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const copy = (guidesStructured || []).slice();
                            if (!copy[gi].videos) copy[gi].videos = [];
                            copy[gi].videos!.push({ id: "", label: "" });
                            setGuidesStructured(copy);
                          }}
                          className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {(guide.videos || []).map((vid, vi) => (
                        <div key={vi} className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                            placeholder="Label"
                            value={vid.label || ""}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].videos![vi] = { ...vid, label: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <input
                            className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm font-mono"
                            placeholder="Video ID"
                            value={vid.id}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].videos![vi] = { ...vid, id: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].videos!.splice(vi, 1);
                              setGuidesStructured(copy);
                            }}
                            className="hover:bg-red-500/10 w-full sm:w-auto"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Tools */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs md:text-sm font-medium text-foreground">Tools</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const copy = (guidesStructured || []).slice();
                            if (!copy[gi].tools) copy[gi].tools = [];
                            copy[gi].tools!.push({ url: "", label: "" });
                            setGuidesStructured(copy);
                          }}
                          className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {(guide.tools || []).map((tool, ti) => (
                        <div key={ti} className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                            placeholder="Label"
                            value={tool.label || ""}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].tools![ti] = { ...tool, label: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <input
                            className="flex-[2] p-2 border border-border rounded bg-background text-foreground text-sm"
                            placeholder="URL"
                            value={tool.url}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].tools![ti] = { ...tool, url: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].tools!.splice(ti, 1);
                              setGuidesStructured(copy);
                            }}
                            className="hover:bg-red-500/10 w-full sm:w-auto"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Images */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs md:text-sm font-medium text-foreground">Images</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const copy = (guidesStructured || []).slice();
                            if (!copy[gi].images) copy[gi].images = [];
                            copy[gi].images!.push({ src: "", alt: "" });
                            setGuidesStructured(copy);
                          }}
                          className="text-foreground hover:text-primary hover:bg-primary/10 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {(guide.images || []).map((img, ii) => (
                        <div key={ii} className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            className="flex-[2] p-2 border border-border rounded bg-background text-foreground text-sm"
                            placeholder="Image Path"
                            value={img.src}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].images![ii] = { ...img, src: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <input
                            className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                            placeholder="Alt text"
                            value={img.alt || ""}
                            onChange={(e) => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].images![ii] = { ...img, alt: e.target.value };
                              setGuidesStructured(copy);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const copy = (guidesStructured || []).slice();
                              copy[gi].images!.splice(ii, 1);
                              setGuidesStructured(copy);
                            }}
                            className="hover:bg-red-500/10 w-full sm:w-auto"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Note */}
                    <div className="border-t border-border pt-4">
                      <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2">
                        Note (optional)
                      </label>
                      <input
                        className="w-full p-2 border border-border rounded bg-background text-foreground text-sm"
                        placeholder="e.g., For a quick look, check the guides below!"
                        value={guide.note || ""}
                        onChange={(e) => {
                          const copy = (guidesStructured || []).slice();
                          copy[gi] = { ...copy[gi], note: e.target.value };
                          setGuidesStructured(copy);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={() => {
                  const copy = (guidesStructured || []).slice();
                  copy.push({
                    id: "new_guide",
                    title: "New Guide",
                    description: "",
                    steamGuides: [],
                    videos: [],
                    tools: [],
                    images: []
                  });
                  setGuidesStructured(copy);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white text-sm md:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Guide
              </Button>
            </div>
          )}

          {active === "stream" && streamStructured && (
            <div className="space-y-4 md:space-y-6">
              {/* Twitch */}
              <Card className="gaming-card">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl text-foreground">Twitch Streamers</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const copy = { ...streamStructured };
                        copy.twitch.push({ name: "", username: "", url: "" });
                        setStreamStructured(copy);
                      }}
                      className="text-foreground hover:text-primary hover:bg-primary/10 text-xs md:text-sm"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Add Streamer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-3">
                  {streamStructured.twitch.map((t, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2">
                      <input
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                        placeholder="Name"
                        value={t.name}
                        onChange={(e) => {
                          const copy = { ...streamStructured };
                          copy.twitch[i].name = e.target.value;
                          setStreamStructured(copy);
                        }}
                      />
                      <input
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                        placeholder="Username"
                        value={t.username}
                        onChange={(e) => {
                          const copy = { ...streamStructured };
                          copy.twitch[i].username = e.target.value;
                          setStreamStructured(copy);
                        }}
                      />
                      <input
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                        placeholder="URL"
                        value={t.url}
                        onChange={(e) => {
                          const copy = { ...streamStructured };
                          copy.twitch[i].url = e.target.value;
                          setStreamStructured(copy);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const copy = { ...streamStructured };
                          copy.twitch.splice(i, 1);
                          setStreamStructured(copy);
                        }}
                        className="hover:bg-red-500/10 w-full sm:w-auto"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* YouTube */}
              <Card className="gaming-card">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl text-foreground">YouTube Channels</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const copy = { ...streamStructured };
                        copy.youtube.push({ name: "", channelId: "", url: "" });
                        setStreamStructured(copy);
                      }}
                      className="text-foreground hover:text-primary hover:bg-primary/10 text-xs md:text-sm"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Add Channel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-3">
                  {streamStructured.youtube.map((y, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2">
                      <input
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                        placeholder="Name"
                        value={y.name}
                        onChange={(e) => {
                          const copy = { ...streamStructured };
                          copy.youtube[i].name = e.target.value;
                          setStreamStructured(copy);
                        }}
                      />
                      <input
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                        placeholder="Channel ID"
                        value={y.channelId}
                        onChange={(e) => {
                          const copy = { ...streamStructured };
                          copy.youtube[i].channelId = e.target.value;
                          setStreamStructured(copy);
                        }}
                      />
                      <input
                        className="flex-1 p-2 border border-border rounded bg-background text-foreground text-sm md:text-base"
                        placeholder="URL"
                        value={y.url}
                        onChange={(e) => {
                          const copy = { ...streamStructured };
                          copy.youtube[i].url = e.target.value;
                          setStreamStructured(copy);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const copy = { ...streamStructured };
                          copy.youtube.splice(i, 1);
                          setStreamStructured(copy);
                        }}
                        className="hover:bg-red-500/10 w-full sm:w-auto"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;