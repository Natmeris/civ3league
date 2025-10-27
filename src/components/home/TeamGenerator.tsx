import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Users, Shuffle, Sparkles, ChevronDown } from "lucide-react";
import { GameMode, LeaderboardEntry, fetchModeData } from "@/lib/leaderboardData";

type RatedPlayer = { name: string; rating: number; pos?: number };

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const n = arr.length;
  const idxs = Array.from({ length: k }, (_, i) => i);
  const getCombo = () => idxs.map((i) => arr[i]);
  if (k === 0) return [[]];
  if (k > n) return [];
  result.push(getCombo());
  while (true) {
    let i = k - 1;
    while (i >= 0 && idxs[i] === i + n - k) i--;
    if (i < 0) break;
    idxs[i]++;
    for (let j = i + 1; j < k; j++) idxs[j] = idxs[j - 1] + 1;
    result.push(getCombo());
  }
  return result;
}

export default function TeamGenerator() {
  const [mode, setMode] = useState<GameMode>("MPT");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>(Array(8).fill(""));
  const [result, setResult] = useState<{
    captains: [RatedPlayer, RatedPlayer];
    splitA: RatedPlayer[];
    splitB: RatedPlayer[];
    recommendation: "A" | "B";
    team1: RatedPlayer[]; // captain1's team
    team2: RatedPlayer[]; // captain2's team
    sum1: number;
    sum2: number;
    delta: number;
    positionMap: Map<string, number>; // Track original input positions
    optionA: { sum1: number; sum2: number; avg1: number; avg2: number; p1: number; p2: number; delta: number };
    optionB: { sum1: number; sum2: number; avg1: number; avg2: number; p1: number; p2: number; delta: number };
  } | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchModeData(mode)
      .then((rows) => {
        setData(rows);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [mode]);

  const suggestions = useMemo(() => ["New Player", ...data.map((d) => d.player)], [data]);
  const ratingByName = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.player.toLowerCase(), d.rating));
    return m;
  }, [data]);

  const rounded = (n: number) => Math.round(n);
  const pct = (p: number) => `${(p * 100).toFixed(1)}%`;
  const eloProb = (ra: number, rb: number) => 1 / (1 + Math.pow(10, (rb - ra) / 400));

  const handleAutofillTop8 = () => {
    const top8 = data
      .slice()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8)
      .map((d) => d.player);
    setNames((prev) => {
      const next = prev.slice();
      for (let i = 0; i < 8; i++) next[i] = top8[i] || "";
      return next;
    });
    setResult(null);
    setWarning(null);
  };

  const compute = () => {
    setResult(null);
    setWarning(null);
    // Build rated players list
    const entered = names.map((n) => n.trim()).filter((n) => n.length > 0);
    // Duplicate detection (case-insensitive), but allow duplicates for 'New Player'
    const seen = new Set<string>();
    for (const n of entered) {
      const key = n.toLowerCase();
      if (key !== "new player") {
        if (seen.has(key)) {
          setError(`Duplicate player detected: ${n}`);
          return;
        }
        seen.add(key);
      }
    }
    const provided = entered;
    if (provided.length < 4) {
      setError("Please enter at least 4 unique players.");
      return;
    }
    if (provided.length % 2 !== 0) {
      setError("Please provide an even number of players (e.g., 4, 6, or 8).");
      return;
    }
    if (provided.length > 8) {
      setError("Up to 8 players are supported.");
      return;
    }

    const rated: RatedPlayer[] = [];
    const missing: string[] = [];
    const positionMap = new Map<string, number>(); // Track original input position
    for (let i = 0; i < provided.length; i++) {
      const n = provided[i];
      const lower = n.toLowerCase();
      positionMap.set(lower, i + 1);
      const r = lower === "new player" ? 1200 : ratingByName.get(lower);
      if (r == null) missing.push(n);
      else rated.push({ name: n, rating: r, pos: i + 1 });
    }
    if (missing.length) {
      setError(`Player(s) not found for ${mode}: ${missing.join(", ")}`);
      return;
    }

    rated.sort((a, b) => b.rating - a.rating);
    const captain1 = rated[0];
    const captain2 = rated[1];
    // If user entered captains wrong (first two inputs are not the two highest-rated), warn and repopulate fields
    const i0 = names[0]?.trim().toLowerCase();
    const i1 = names[1]?.trim().toLowerCase();
    const top1 = captain1.name.toLowerCase();
    const top2 = captain2.name.toLowerCase();
    const firstTwoAreTopTwo = (i0 === top1 && i1 === top2) || (i0 === top2 && i1 === top1);
    if (!firstTwoAreTopTwo) {
      // Rebuild names placing captains in the first two slots and keep the rest in original order without duplicates
      const remaining = names
        .map((n) => n.trim())
        .filter((n) => n.length > 0)
        .filter((n) => n.toLowerCase() !== top1 && n.toLowerCase() !== top2);
      const newNames = Array(8).fill("");
      newNames[0] = captain1.name;
      newNames[1] = captain2.name;
      for (let i = 0; i < Math.min(6, remaining.length); i++) newNames[2 + i] = remaining[i];
      setNames(newNames);
      setWarning(`Adjusted captains: ${captain1.name} (Captain 1) and ${captain2.name} (Captain 2).`);
    }
    const rest = rated.slice(2);
    const k = rest.length / 2;
    if (!Number.isInteger(k)) {
      setError("The number of remaining players must be even.");
      return;
    }

    let best: null | {
      A: RatedPlayer[];
      B: RatedPlayer[];
      pick: "A" | "B";
      team1: RatedPlayer[];
      team2: RatedPlayer[];
      sum1: number;
      sum2: number;
      delta: number;
    } = null;

    const allCombos = combinations(rest, k);
    for (const A of allCombos) {
      // Use object identity to support duplicate names like "New Player"
      const Aset = new Set<RatedPlayer>(A);
      const B = rest.filter((p) => !Aset.has(p));
      const sumA = A.reduce((s, p) => s + p.rating, 0);
      const sumB = B.reduce((s, p) => s + p.rating, 0);

      // If captain2 picks A
      const sum1_ifA = captain1.rating + sumB; // team1 = cap1 + B
      const sum2_ifA = captain2.rating + sumA; // team2 = cap2 + A
  const deltaA = Math.abs(sum1_ifA - sum2_ifA);

      // If captain2 picks B
      const sum1_ifB = captain1.rating + sumA; // team1 = cap1 + A
      const sum2_ifB = captain2.rating + sumB; // team2 = cap2 + B
      const deltaB = Math.abs(sum1_ifB - sum2_ifB);

      // Second captain should pick the option that minimizes the delta
      if (best === null || Math.min(deltaA, deltaB) < best.delta) {
        if (deltaA <= deltaB) {
          best = {
            A,
            B,
            pick: "A",
            team1: [captain1, ...B],
            team2: [captain2, ...A],
            sum1: sum1_ifA,
            sum2: sum2_ifA,
            delta: deltaA,
          };
        } else {
          best = {
            A,
            B,
            pick: "B",
            team1: [captain1, ...A],
            team2: [captain2, ...B],
            sum1: sum1_ifB,
            sum2: sum2_ifB,
            delta: deltaB,
          };
        }
      }
    }

    if (best) {
      // Build probability summaries for both options
      const sum1A = captain1.rating + best.B.reduce((s, p) => s + p.rating, 0);
      const sum2A = captain2.rating + best.A.reduce((s, p) => s + p.rating, 0);
      const avg1A = sum1A / (1 + best.B.length);
      const avg2A = sum2A / (1 + best.A.length);
      const p1A = eloProb(avg1A, avg2A);

      const sum1B = captain1.rating + best.A.reduce((s, p) => s + p.rating, 0);
      const sum2B = captain2.rating + best.B.reduce((s, p) => s + p.rating, 0);
      const avg1B = sum1B / (1 + best.A.length);
      const avg2B = sum2B / (1 + best.B.length);
      const p1B = eloProb(avg1B, avg2B);

      setResult({
        captains: [captain1, captain2],
        splitA: best.A,
        splitB: best.B,
        recommendation: best.pick,
        team1: best.team1,
        team2: best.team2,
        sum1: best.sum1,
        sum2: best.sum2,
        delta: best.delta,
        positionMap, // Add position tracking
        optionA: { sum1: sum1A, sum2: sum2A, avg1: avg1A, avg2: avg2A, p1: p1A, p2: 1 - p1A, delta: Math.abs(sum1A - sum2A) },
        optionB: { sum1: sum1B, sum2: sum2B, avg1: avg1B, avg2: avg2B, p1: p1B, p2: 1 - p1B, delta: Math.abs(sum1B - sum2B) },
      });
      setError(null);
    } else {
      setError("Unable to generate teams. Please adjust the player list.");
    }
  };

  const gameModes: GameMode[] = ["MPT", "Modern", "FUT", "QC", "MDJ", "UU", "CW", "Overall"];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-6 h-6 text-primary" />
              Team Generator (ELO-based)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Inputs */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Game Mode</label>
                    <Select
                      value={mode}
                      onValueChange={(v) => {
                        setMode(v as GameMode);
                        // Clear all inputs and state when mode changes to avoid stale calculations
                        setNames(Array(8).fill(""));
                        setResult(null);
                        setError(null);
                        setWarning(null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center justify-between w-full">
                          <SelectValue placeholder="Select mode" />
                          <ChevronDown className="w-4 h-4 text-primary" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {gameModes.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={handleAutofillTop8}
                      variant="outline"
                      className="w-full text-foreground hover:text-primary hover:bg-primary/10"
                    >
                      Autofill Top 8
                    </Button>
                    <Button
                      onClick={() => { setNames(Array(8).fill("")); setResult(null); }}
                      variant="outline"
                      className="w-28 text-foreground hover:text-primary hover:bg-primary/10"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {names.map((val, i) => (
                    <div key={i} className="space-y-1">
                      <label className="block text-xs text-muted-foreground">Player {i + 1}{i === 0 ? " (Captain 1)" : i === 1 ? " (Captain 2)" : ""}</label>
                      <Input
                        list="player-suggestions"
                        placeholder="Type a player name"
                        value={val}
                        onChange={(e) => { const next = names.slice(); next[i] = e.target.value; setNames(next); setResult(null); }}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <datalist id="player-suggestions">
                    {suggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <div className="lg:col-span-1">
                  <Button onClick={compute} disabled={loading} className="bg-[var(--civ3-gold)] text-[var(--civ3-blue)] border border-[var(--civ3-border)] font-bold shadow-md hover:bg-yellow-300">
                    Generate Teams
                  </Button>
                  {error && (
                    <Badge variant="destructive" className="text-white mt-2">{error}</Badge>
                  )}
                  {warning && !error && (
                    <span className="text-sm text-yellow-400 block mt-2">{warning}</span>
                  )}
                </div>
              </div>

{/* Right: Pick Recommendation */}
<div className="lg:col-span-1 flex items-center justify-center pb-[29px]">
  {result ? (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-green-900/30 p-4 rounded-lg border border-green-700/50 shadow-lg text-center">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Sparkles className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Recommended Pick</h3>
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {result.captains[0].name.split(' ')[0]} vs {result.captains[1].name.split(' ')[0]}
        </p>
        <p className="text-lg text-white mb-3">
          {result.splitA.map(p => (p.pos ?? result.positionMap.get(p.name.toLowerCase()))).join(', ')} vs{' '}
          {result.splitB.map(p => (p.pos ?? result.positionMap.get(p.name.toLowerCase()))).join(', ')}
        </p>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4" /> Captain 2 picks{' '}
          {result.recommendation === 'A'
            ? result.splitA.map(p => (p.pos ?? result.positionMap.get(p.name.toLowerCase()))).join(', ')
            : result.splitB.map(p => (p.pos ?? result.positionMap.get(p.name.toLowerCase()))).join(', ')}
        </p>
      </div>
    </div>
  ) : (
    <div className="text-sm text-muted-foreground text-center max-w-md mx-auto pb-[5px]">
      Enter up to 8 players and click Generate to see balanced teams.
    </div>
  )}
</div>

            </div>

            {/* Final Teams - Full Width Below */}
            {result && (
              <div className="mt-6 space-y-6">
                {/* Pick A Final Teams */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                  <h3 className="font-semibold text-white mb-1">Pick A</h3>
                  <p className="text-xs text-muted-foreground mb-3">If Captain 2 picks {result.splitA.map(p => (p.pos ?? result.positionMap.get(p.name.toLowerCase()))).join(', ')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded border border-border/50 bg-background/60">
                      <p className="font-semibold text-primary mb-2">Final Team A</p>
                      <ul className="space-y-1 text-sm text-white">
                        {[result.captains[0], ...result.splitB].map((p, idx) => (
                          <li key={`${p.name}-${p.pos ?? idx}`}>{p.name} <span className="font-mono">({rounded(p.rating)})</span></li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-white">Total ELO: <span className="font-mono">{rounded(result.optionA.sum1)}</span></p>
                      <p className="text-sm text-white">Win prob: <span className="font-mono">{pct(result.optionA.p1)}</span></p>
                    </div>
                    <div className="p-3 rounded border border-border/50 bg-background/60">
                      <p className="font-semibold text-primary mb-2">Final Team B</p>
                      <ul className="space-y-1 text-sm text-white">
                        {[result.captains[1], ...result.splitA].map((p, idx) => (
                          <li key={`${p.name}-${p.pos ?? idx}`}>{p.name} <span className="font-mono">({rounded(p.rating)})</span></li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-white">Total ELO: <span className="font-mono">{rounded(result.optionA.sum2)}</span></p>
                      <p className="text-sm text-white">Win prob: <span className="font-mono">{pct(result.optionA.p2)}</span></p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white">ELO Difference: <span className="font-mono">{rounded(result.optionA.delta)}</span></p>
                </div>

                {/* Pick B Final Teams */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                  <h3 className="font-semibold text-white mb-1">Pick B</h3>
                  <p className="text-xs text-muted-foreground mb-3">If Captain 2 picks {result.splitB.map(p => (p.pos ?? result.positionMap.get(p.name.toLowerCase()))).join(', ')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded border border-border/50 bg-background/60">
                      <p className="font-semibold text-primary mb-2">Final Team A</p>
                      <ul className="space-y-1 text-sm text-white">
                        {[result.captains[0], ...result.splitA].map((p, idx) => (
                          <li key={`${p.name}-${p.pos ?? idx}`}>{p.name} <span className="font-mono">({rounded(p.rating)})</span></li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-white">Total ELO: <span className="font-mono">{rounded(result.optionB.sum1)}</span></p>
                      <p className="text-sm text-white">Win prob: <span className="font-mono">{pct(result.optionB.p1)}</span></p>
                    </div>
                    <div className="p-3 rounded border border-border/50 bg-background/60">
                      <p className="font-semibold text-primary mb-2">Final Team B</p>
                      <ul className="space-y-1 text-sm text-white">
                        {[result.captains[1], ...result.splitB].map((p, idx) => (
                          <li key={`${p.name}-${p.pos ?? idx}`}>{p.name} <span className="font-mono">({rounded(p.rating)})</span></li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-white">Total ELO: <span className="font-mono">{rounded(result.optionB.sum2)}</span></p>
                      <p className="text-sm text-white">Win prob: <span className="font-mono">{pct(result.optionB.p2)}</span></p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white">ELO Difference: <span className="font-mono">{rounded(result.optionB.delta)}</span></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
