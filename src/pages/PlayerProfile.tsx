import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Trophy } from "lucide-react";
import { fetchModeData, GameMode } from "@/lib/leaderboardData";


type PlayerModeStats = {
  mode: GameMode;
  rank: number;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  cton?: number;
};

// Minimal CSV parser consistent with Leaderboard implementation
function parseCSVRows(csv: string): string[][] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows: string[][] = [];
  for (const line of lines) {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur); cur = '';
      } else { cur += ch; }
    }
    out.push(cur);
    rows.push(out.map(s => s.trim().replace(/^"|"$/g, '')));
  }
  return rows;
}

function findIndex(header: string[], ...names: string[]) {
  const norm = header.map(h => h.toLowerCase().replace(/\s+/g, ''));
  for (const n of names) {
    const idx = norm.findIndex(h => h === n || h.includes(n));
    if (idx !== -1) return idx;
  }
  return -1;
}

const PlayerProfile = () => {
  const { name } = useParams<{ name: string }>();
  const playerName = decodeURIComponent(name || "");
  const modes: GameMode[] = ["Overall", "MPT", "Modern", "FUT", "QC", "MDJ", "UU", "CW"];
  const [data, setData] = useState<PlayerModeStats[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const settled = await Promise.allSettled(modes.map(m => fetchModeData(m)));
        if (cancelled) return;

        const results: PlayerModeStats[] = [];
        const target = playerName.trim().toLowerCase();

        settled.forEach((res, idx) => {
          const mode = modes[idx];
          if (res.status === "fulfilled") {
            const entries = res.value;
            const match = entries.find(e => e.player.trim().toLowerCase() === target);
            if (match) {
              results.push({
                mode,
                rank: match.rank,
                rating: match.rating,
                gamesPlayed: match.gamesPlayed,
                wins: match.wins,
                losses: match.losses,
                winRate: match.winRate,
                cton: match.cton,
              });
            }
          }
        });

        setData(results);
      } catch (e:any) {
        if (cancelled) return; setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (playerName) run();
    return () => { cancelled = true; };
  }, [playerName]);

  // Separate Overall from per-mode stats
  const overall = useMemo(() => (data || []).find(d => d.mode === 'Overall'), [data]);
  const modeData = useMemo(() => (data || []).filter(d => d.mode !== 'Overall'), [data]);
  const sorted = useMemo(() => modeData.slice().sort((a,b) => b.rating - a.rating), [modeData]);

  // Simple colors per mode (consistent palette)
  const colors: Record<GameMode, string> = {
    Overall: '#f59e0b',
    MPT: '#3b82f6',
    Modern: '#10b981',
    FUT: '#ec4899',
    QC: '#06b6d4',
    MDJ: '#8b5cf6',
    UU: '#f97316',
    CW: '#a3e635',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link to="/"> <ArrowLeft className="w-4 h-4 mr-2"/> Back</Link>
          </Button>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold text-gradient">{playerName}</h1>
          </div>
          <div />
        </div>

        {loading && (
          <Card className="gaming-card">
            <CardContent className="py-12">
              <p className="text-muted-foreground text-center">Loading profile…</p>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Card className="gaming-card">
            <CardContent className="py-12">
              <p className="text-red-500 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Summary */}
        {!loading && !error && (data && data.length > 0) && (
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-primary">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overall && (
                  <>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Overall Rank</div>
                      <div className="text-lg font-bold">#{overall.rank}</div>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Overall Rating</div>
                      <div className="text-lg font-bold">{overall.rating}</div>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Overall Record</div>
                      <div className="text-lg font-bold">{overall.wins}-{overall.losses}</div>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Overall Win Rate</div>
                      <div className="text-lg font-bold">{overall.winRate.toFixed(1)}%</div>
                    </div>
                  </>
                )}
                {sorted.length > 0 && (
                  <>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Best Mode</div>
                      <div className="text-lg font-bold">{sorted[0].mode}</div>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Best Mode Rank</div>
                      <div className="text-lg font-bold">#{sorted[0].rank}</div>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Highest Win Rate</div>
                      <div className="text-lg font-bold">{sorted.slice().sort((a,b)=>b.winRate-a.winRate)[0].mode} ({sorted.slice().sort((a,b)=>b.winRate-a.winRate)[0].winRate.toFixed(1)}%)</div>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <div className="text-sm text-muted-foreground">Total Games</div>
                      <div className="text-lg font-bold">{(overall?.gamesPlayed || 0) + sorted.reduce((sum,s)=>sum+s.gamesPlayed,0)}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mode Rankings Table */}
        {!loading && !error && sorted.length > 0 && (
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-primary">Mode Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Visual bar chart */}
              <div className="mb-6 space-y-3">
                {sorted.map(s => (
                  <div key={s.mode} className="flex items-center gap-3">
                    <div className="w-20 text-right text-sm font-medium">{s.mode}</div>
                    <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.max(5, (s.rating / (sorted[0]?.rating || 1)) * 100)}%`, 
                          backgroundColor: colors[s.mode] 
                        }} 
                      />
                    </div>
                    <div className="w-20 text-sm text-right">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{s.rating}</Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-xs text-muted-foreground text-center">
                  Bars are scaled to the player's highest rating across modes.
                </div>
              </div>

              {/* Detailed table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Mode</th>
                      <th className="text-center p-2">Rank</th>
                      <th className="text-center p-2">Rating</th>
                      <th className="text-center p-2">Record</th>
                      <th className="text-center p-2">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(s => (
                      <tr key={s.mode} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: colors[s.mode] }} />
                          <span className="font-medium">{s.mode}</span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="secondary">#{s.rank}</Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{s.rating}</Badge>
                        </td>
                        <td className="p-2 text-center text-muted-foreground">{s.wins}-{s.losses}</td>
                        <td className="p-2 text-center">
                          <span className={`font-medium ${
                            s.winRate >= 60 ? 'text-green-500' :
                            s.winRate >= 50 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {s.winRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default PlayerProfile;
