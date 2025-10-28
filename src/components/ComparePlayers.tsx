import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, UserPlus, Trophy, TrendingUp } from "lucide-react";
import { fetchModeData, GameMode, LeaderboardEntry } from "@/lib/leaderboardData";
import { cn } from "@/lib/utils";

type Props = { initial?: string[]; compact?: boolean; showTable?: boolean; onPlayersChange?: (players: string[]) => void };

const PLAYER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#a3e635'
];

export default function ComparePlayersFixed({ initial = [], compact = false, showTable = true, onPlayersChange }: Props) {
  const modes: GameMode[] = ["Overall", "MPT", "Modern", "FUT", "QC", "MDJ", "UU", "CW"];
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<string[]>(initial.map((p) => p.trim()).filter(Boolean));
  const [modeData, setModeData] = useState<Record<GameMode, LeaderboardEntry[]>>({} as any);
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const mapped: Record<GameMode, LeaderboardEntry[]> = {} as any;
      await Promise.all(
        modes.map(async (m) => {
          try {
            mapped[m] = await fetchModeData(m);
          } catch {
            mapped[m] = [];
          }
        })
      );
      if (!cancelled) {
        setModeData(mapped);
        const names = new Set<string>();
        for (const m of modes) (mapped[m] || []).forEach((e) => names.add(e.player.trim()));
        setAvailableNames(Array.from(names).sort((a, b) => a.localeCompare(b)));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPlayers((prev) => Array.from(new Set(prev.map((p) => p.trim()).filter(Boolean))));
  }, []);

  useEffect(() => {
    if (onPlayersChange) onPlayersChange(players.slice());
  }, [players, onPlayersChange]);

  const addPlayerByName = (name: string) => {
    const v = name.trim();
    if (!v) return;
    const found = availableNames.find((n) => n.toLowerCase() === v.toLowerCase());
    if (!found) return;
    setPlayers((prev) => Array.from(new Set([...prev, found])));
    setInput("");
    setSuggestions([]);
  };

  const addPlayer = () => addPlayerByName(input);
  const removePlayer = (name: string) => setPlayers((prev) => prev.filter((p) => p !== name));

  const playerStats = useMemo(() => {
    const out: Record<string, Record<GameMode, LeaderboardEntry | null>> = {};
    for (const p of players) {
      out[p] = {} as any;
      for (const m of modes) {
        const entries = modeData[m] || [];
        out[p][m] = entries.find((e) => e.player.trim().toLowerCase() === p.trim().toLowerCase()) || null;
      }
    }
    return out;
  }, [players, modeData]);

  const bestForMode = useMemo(() => {
    const out: Record<string, string> = {};
    for (const m of modes) {
      let bestName = '';
      let bestScore = -Infinity;
      for (const p of players) {
        const entry = playerStats[p] && playerStats[p][m];
        if (entry && typeof entry.rating === 'number') {
          if (entry.rating > bestScore) {
            bestScore = entry.rating;
            bestName = p;
          }
        }
      }
      out[m] = bestName ? `${bestName} - ${bestScore}` : 'N/A';
    }
    return out;
  }, [players, playerStats]);

  const bestNameForMode = useMemo(() => {
    const out: Record<string, string | null> = {};
    for (const m of modes) {
      let bestName: string | null = null;
      let bestScore = -Infinity;
      for (const p of players) {
        const entry = playerStats[p] && playerStats[p][m];
        if (entry && typeof entry.rating === 'number') {
          if (entry.rating > bestScore) {
            bestScore = entry.rating;
            bestName = p;
          }
        }
      }
      out[m] = bestName;
    }
    return out;
  }, [players, playerStats]);

  const bestCountsForPlayer = useMemo(() => {
    const counts: Record<string, number> = {} as any;
    const topMode: Record<string, string | null> = {} as any;
    for (const p of players) { counts[p] = 0; topMode[p] = null; }
    for (const m of modes) {
      const name = bestNameForMode[m];
      if (name) {
        counts[name] = (counts[name] || 0) + 1;
        if (!topMode[name]) topMode[name] = m;
      }
    }
    return { counts, topMode };
  }, [players, bestNameForMode]);

  useEffect(() => {
    const q = input.trim().toLowerCase();
    if (!q) return setSuggestions([]);
    setSuggestions(availableNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 8));
  }, [input, availableNames]);

  if (compact) {
    return (
      <Card className="gaming-card mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gradient flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Compare Players
            </h3>
            <Button asChild size="sm" variant="outline" className="text-foreground hover:text-primary hover:bg-primary/10">
              <a href={`/compare?players=${players.map(encodeURIComponent).join(',')}`}>
                View Full Analysis
              </a>
            </Button>
          </div>

          <div className="relative mb-4">
            <Input
              value={input}
              onChange={(e: any) => setInput(e.target.value)}
              placeholder="Type player name to compare..."
              className="pl-10 bg-background text-foreground border-border focus-visible:ring-primary"
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  if (availableNames.some((n) => n.toLowerCase() === input.trim().toLowerCase())) addPlayer();
                }
              }}
            />
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-card border border-primary/30 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                {suggestions.map((s) => (
                  <div 
                    key={s} 
                    className="px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                    onClick={() => addPlayerByName(s)}
                  >
                    <span className="font-medium text-foreground">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {players.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {players.map((p, idx) => (
                <Badge 
                  key={p} 
                  variant="outline"
                  className="text-sm px-3 py-2 flex items-center gap-2 group"
                  style={{ 
                    backgroundColor: `${PLAYER_COLORS[idx % PLAYER_COLORS.length]}15`,
                    borderColor: PLAYER_COLORS[idx % PLAYER_COLORS.length],
                    color: PLAYER_COLORS[idx % PLAYER_COLORS.length]
                  }}
                >
                  <span className="font-semibold">{p}</span>
                  <button 
                    aria-label={`Remove ${p}`} 
                    onClick={() => removePlayer(p)} 
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Start typing to add players for comparison</p>
            </div>
          )}

          {players.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-3 text-left font-bold text-foreground">Mode</th>
                    {players.map((p, idx) => (
                      <th 
                        key={p} 
                        className="p-3 text-center font-bold"
                        style={{ color: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                      >
                        {p}
                      </th>
                    ))}
                    <th className="p-3 text-center font-bold text-primary">
                      <Trophy className="w-4 h-4 inline mr-1" />
                      Best
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground">Overall</td>
                    {players.map((p) => {
                      const rating = playerStats[p]?.["Overall"]?.rating;
                      return (
                        <td key={p} className="p-3 text-center">
                          {rating ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold">
                              {rating}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className="bg-primary/20 text-primary font-bold">
                        {bestForMode['Overall']}
                      </Badge>
                    </td>
                  </tr>
                  {modes.filter((m) => m !== "Overall").map((m) => (
                    <tr key={m} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium text-foreground">{m}</td>
                      {players.map((p) => {
                        const rating = playerStats[p]?.[m]?.rating;
                        return (
                          <td key={p} className="p-3 text-center">
                            {rating ? (
                              <span className="font-semibold text-foreground">{rating}</span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center text-sm text-muted-foreground">
                        {bestForMode[m]}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-bold text-primary">Best In</td>
                    {players.map((p) => {
                      const c = bestCountsForPlayer.counts?.[p] || 0;
                      const top = bestCountsForPlayer.topMode?.[p] || null;
                      return (
                        <td key={p} className="p-3 text-center">
                          {c === 0 ? (
                            <span className="text-muted-foreground">0 modes</span>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                              {c === 1 ? top : `${c} modes`}
                            </Badge>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <Trophy className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

    return (
    <Card className="gaming-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Input 
              value={input} 
              onChange={(e: any) => setInput(e.target.value)} 
              placeholder="Type player name to add..." 
              className="pl-10 bg-background text-foreground border-border focus-visible:ring-primary"
              onKeyDown={(e: any) => { 
                if (e.key === "Enter") { 
                  if (availableNames.some(n=>n.toLowerCase()===input.trim().toLowerCase())) addPlayer(); 
                } 
              }} 
            />
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-card border border-primary/30 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                {suggestions.map((s) => (
                  <div 
                    key={s} 
                    className="px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors border-b border-border/50 last:border-0" 
                    onClick={() => addPlayerByName(s)}
                  >
                    <span className="font-medium text-foreground">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {players.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {players.map((p, idx) => (
                <Badge 
                  key={p} 
                  variant="outline"
                  className="text-base px-4 py-2 flex items-center gap-2"
                  style={{ 
                    backgroundColor: `${PLAYER_COLORS[idx % PLAYER_COLORS.length]}15`,
                    borderColor: PLAYER_COLORS[idx % PLAYER_COLORS.length],
                    color: PLAYER_COLORS[idx % PLAYER_COLORS.length]
                  }}
                >
                  <span className="font-semibold">{p}</span>
                  <button 
                    aria-label={`Remove ${p}`} 
                    onClick={() => removePlayer(p)} 
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {players.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Add players above to compare their ratings across all modes</p>
            </div>
          )}

          {players.length > 0 && showTable && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-4 text-left font-bold text-foreground">Mode</th>
                    {players.map((p, idx) => (
                      <th 
                        key={p} 
                        className="p-4 text-center font-bold"
                        style={{ color: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                      >
                        {p}
                      </th>
                    ))}
                    <th className="p-4 text-center font-bold text-primary">
                      <Trophy className="w-5 h-5 inline mr-1" />
                      Best
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground">Overall</td>
                    {players.map((p) => {
                      const rating = playerStats[p]?.["Overall"]?.rating;
                      return (
                        <td key={p} className="p-4 text-center">
                          {rating ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold text-base">
                              {rating}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <Badge variant="secondary" className="bg-primary/20 text-primary font-bold">
                        {bestForMode['Overall']}
                      </Badge>
                    </td>
                  </tr>
                  {modes.filter((m) => m !== "Overall").map((m) => (
                    <tr key={m} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-foreground">{m}</td>
                      {players.map((p) => {
                        const rating = playerStats[p]?.[m]?.rating;
                        return (
                          <td key={p} className="p-4 text-center">
                            {rating ? (
                              <span className="font-semibold text-foreground text-base">{rating}</span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-4 text-center text-muted-foreground">
                        {bestForMode[m]}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 hover:bg-muted/40 transition-colors">
                    <td className="p-4 font-bold text-primary">Best In</td>
                    {players.map((p) => {
                      const c = bestCountsForPlayer.counts?.[p] || 0;
                      const top = bestCountsForPlayer.topMode?.[p] || null;
                      return (
                        <td key={p} className="p-4 text-center">
                          {c === 0 ? (
                            <span className="text-muted-foreground">0 modes</span>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-base">
                              {c === 1 ? top : `${c} modes`}
                            </Badge>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <Trophy className="w-6 h-6 text-primary mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}