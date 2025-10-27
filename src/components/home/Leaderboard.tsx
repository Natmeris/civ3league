import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Search, ArrowUpDown, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  player: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  cton: number;
}

type GameMode = "Overall" | "MPT" | "Modern" | "FUT" | "QC" | "MDJ" | "UU" | "CW";

// Google Sheets published document ID and sheet GIDs for each mode
const PUBLISHED_DOC_ID = "2PACX-1vQFHhHo2i43HoPGGonyLAiCzV7q-P_RB27oMS1eD0qWi72XGE5EqV33XpkS7Zi01F3dyCkO2I-TP9OE";
const SHEET_GIDS: Record<GameMode, string> = {
  Overall: "244794390",
  MPT: "644059342",
  Modern: "715002767",
  FUT: "1605870438",
  QC: "1291609339",
  MDJ: "1937906358",
  UU: "1738898411",
  CW: "1855555132",
};

const Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof LeaderboardEntry>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeMode, setActiveMode] = useState<GameMode>("Overall");
  
  const [leaderboardData, setLeaderboardData] = useState<Record<GameMode, LeaderboardEntry[]>>({
    Overall: [],
    MPT: [],
    Modern: [],
    FUT: [],
    QC: [],
    MDJ: [],
    UU: [],
    CW: [],
  });
  
  const [loading, setLoading] = useState<Record<GameMode, boolean>>({
    Overall: true,
    MPT: false,
    Modern: false,
    FUT: false,
    QC: false,
    MDJ: false,
    UU: false,
    CW: false,
  });
  
  const [error, setError] = useState<Record<GameMode, string | null>>({
    Overall: null,
    MPT: null,
    Modern: null,
    FUT: null,
    QC: null,
    MDJ: null,
    UU: null,
    CW: null,
  });

  // Parse CSV data from Google Sheets
  const parseCSV = (csv: string): LeaderboardEntry[] => {
    const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    // CSV row parser with quotes support
    const parseRow = (line: string): string[] => {
      const out: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out.map(s => s.trim().replace(/^"|"$/g, ''));
    };

    // Find header row
    let headerIdx = 0;
    let headerCells: string[] = parseRow(lines[0]);
    const normalized = (arr: string[]) => arr.map(s => s.toLowerCase().replace(/\s+/g, ''));

    // Look for header row containing common keywords
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const cells = parseRow(lines[i]);
      const norm = normalized(cells);
      if (norm.some(c => c.includes('player') || c.includes('name')) && 
          norm.some(c => c.includes('rating') || c.includes('elo'))) {
        headerIdx = i;
        headerCells = cells;
        break;
      }
    }

    const headerNorm = normalized(headerCells);
    
    // Find column indices
    const findIndex = (...names: string[]) => {
      for (const n of names) {
        const idx = headerNorm.findIndex(h => h === n || h.includes(n));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxRank = findIndex('rank', '#');
    const idxPlayer = findIndex('player', 'name', 'username');
    const idxRating = findIndex('rating', 'elo', 'score');
    const idxGames = findIndex('gamesplayed', 'games', 'gp', 'played');
    const idxWins = findIndex('wins', 'w', 'won');
    const idxLosses = findIndex('losses', 'l', 'lost', 'loss');
    const idxWR = findIndex('winrate', 'win%', 'wr', 'winpct', 'winpercentage');
    const idxCTON = findIndex('cton', 'catchtheoldnewbie', 'catch');

    const toInt = (v: string | undefined, def = 0) => {
      if (!v) return def;
      const cleaned = v.replace(/[%,\s]/g, '');
      const n = parseInt(cleaned, 10);
      return Number.isFinite(n) ? n : def;
    };
    
    const toFloat = (v: string | undefined, def = 0) => {
      if (!v) return def;
      const cleaned = v.replace(/[%,\s]/g, '');
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : def;
    };

    const results: LeaderboardEntry[] = [];
    for (let li = headerIdx + 1; li < lines.length; li++) {
      const row = parseRow(lines[li]);
      const player = (idxPlayer >= 0 ? row[idxPlayer] : row[0])?.trim();
      if (!player || player.length === 0) continue;
      
      const rating = idxRating >= 0 ? toInt(row[idxRating], 1000) : 1000;
      const gamesPlayed = idxGames >= 0 ? toInt(row[idxGames], 0) : 0;
      const wins = idxWins >= 0 ? toInt(row[idxWins], 0) : 0;
      const losses = idxLosses >= 0 ? toInt(row[idxLosses], Math.max(0, gamesPlayed - wins)) : Math.max(0, gamesPlayed - wins);
      
      let winRate = 0;
      if (idxWR >= 0 && row[idxWR]) {
        winRate = toFloat(row[idxWR], 0);
      } else if (gamesPlayed > 0) {
        winRate = (wins / gamesPlayed) * 100;
      }
      
      // If win rate looks like a fraction (e.g., 0.62), convert to percent
      if (winRate > 0 && winRate <= 1) {
        winRate = winRate * 100;
      }
      
      const cton = idxCTON >= 0 ? toInt(row[idxCTON], 0) : 0;
      
      const rank = idxRank >= 0 ? toInt(row[idxRank], results.length + 1) : results.length + 1;

      results.push({ rank, player, rating, gamesPlayed, wins, losses, winRate, cton });
    }

    return results;
  };

  // Fetch data for a specific mode
  const fetchModeData = async (mode: GameMode) => {
    const gid = SHEET_GIDS[mode];
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_DOC_ID}/pub?output=csv&gid=${gid}`;

    setLoading(prev => ({ ...prev, [mode]: true }));
    setError(prev => ({ ...prev, [mode]: null }));

    try {
      console.log(`Fetching ${mode} leaderboard from:`, csvUrl);
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log(`${mode} CSV preview:`, csvText.slice(0, 300));
      
      const data = parseCSV(csvText);
      console.log(`${mode} parsed ${data.length} entries`);
      
      if (data.length === 0) {
        throw new Error('No data found in sheet');
      }
      
      setLeaderboardData(prev => ({ ...prev, [mode]: data }));
    } catch (err) {
      console.error(`Error loading ${mode} leaderboard:`, err);
      setError(prev => ({ 
        ...prev, 
        [mode]: err instanceof Error ? err.message : `Failed to load ${mode} data` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [mode]: false }));
    }
  };

  // Load data when mode changes
  useEffect(() => {
    if (leaderboardData[activeMode].length === 0 && !loading[activeMode] && !error[activeMode]) {
      fetchModeData(activeMode);
    }
  }, [activeMode]);

  // Initial load
  useEffect(() => {
    fetchModeData("Overall");
  }, []);

  // Pagination state
  const [page, setPage] = useState<Record<GameMode, number>>({
    Overall: 1,
    MPT: 1,
    Modern: 1,
    FUT: 1,
    QC: 1,
    MDJ: 1,
    UU: 1,
    CW: 1,
  });
  const ENTRIES_PER_PAGE = 10;

  const filteredAndSortedData = useMemo(() => {
    const currentData = leaderboardData[activeMode];
    let filtered = currentData.filter(entry =>
      entry.player.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    return filtered;
  }, [searchTerm, sortField, sortDirection, leaderboardData, activeMode]);

  // Paginated data for current page
  const paginatedData = useMemo(() => {
    const currentPage = page[activeMode] || 1;
    const start = (currentPage - 1) * ENTRIES_PER_PAGE;
    return filteredAndSortedData.slice(start, start + ENTRIES_PER_PAGE);
  }, [filteredAndSortedData, page, activeMode]);

  const handleSort = (field: keyof LeaderboardEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank <= 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  const totalPages = Math.ceil(filteredAndSortedData.length / ENTRIES_PER_PAGE);
  const currentPage = page[activeMode] || 1;

  const handlePageChange = (newPage: number) => {
    setPage(prev => ({ ...prev, [activeMode]: newPage }));
  };

  const gameModes: GameMode[] = ["Overall", "MPT", "Modern", "FUT", "QC", "MDJ", "UU", "CW"];

  const SortableHeader = ({ field, children }: { field: keyof LeaderboardEntry; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="w-4 h-4 opacity-50" />
      </div>
    </TableHead>
  );

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            Current Season Leaderboard
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Track the top players and their performance in the ongoing season
          </p>
        </div>

        <Card className="gaming-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                2025 Season Rankings
              </CardTitle>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full max-w-full">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full sm:w-auto truncate"
                >
                  <a href="/CivPlayers-Civ3-League/old-leaderboards" className="flex items-center justify-center w-full">
                    <span className="truncate">Old Leaderboards</span>
                    <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as GameMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-14 lg:mb-2 gap-2">
                {(["Overall", "MPT", "Modern", "FUT", "QC", "MDJ", "UU", "CW"] as GameMode[]).map((mode) => (
                  <TabsTrigger
                    key={mode}
                    value={mode}
                    className={cn(
                      "active-leaderboard-tab font-bold border border-[var(--civ3-border)] shadow-md transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--civ3-border)] focus-visible:ring-offset-2 text-sm sm:text-base text-white hover:text-white",
                      activeMode === mode ? "" : "hover:bg-black"
                    )}
                  >
                    {mode}
                  </TabsTrigger>
                ))}
              </TabsList>

              {(["Overall", "MPT", "Modern", "FUT", "QC", "MDJ", "UU", "CW"] as GameMode[]).map((mode) => (
                <TabsContent key={mode} value={mode} className="mt-0">
                  {loading[mode] ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mr-3" />
                      <span className="text-muted-foreground">Loading {mode} leaderboard...</span>
                    </div>
                  ) : error[mode] ? (
                    <div className="text-center py-12 space-y-4">
                      <p className="text-red-500">{error[mode]}</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => fetchModeData(mode)} variant="outline" className="text-red-500 hover:text-red-600">
                          Retry
                        </Button>
                        {/* Helpful links for debugging CSV access */}
                        <a
                          href={`https://docs.google.com/spreadsheets/d/e/${PUBLISHED_DOC_ID}/pub?gid=${SHEET_GIDS[mode]}&single=true&output=csv`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 border border-border rounded text-xs text-foreground hover:text-primary hover:bg-primary/10"
                        >
                          View Published CSV
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table className="league-table">
                          <TableHeader>
                            <TableRow>
                              <SortableHeader field="rank">Rank</SortableHeader>
                              <SortableHeader field="player">Player</SortableHeader>
                              <SortableHeader field="rating">Rating</SortableHeader>
                              <SortableHeader field="gamesPlayed">Games</SortableHeader>
                              <SortableHeader field="wins">Wins</SortableHeader>
                              <SortableHeader field="losses">Losses</SortableHeader>
                              <SortableHeader field="winRate">Win Rate</SortableHeader>
                              <SortableHeader field="cton">CTON</SortableHeader>
                              <TableHead>Profile</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedData.map((entry) => (
                              <TableRow key={entry.player} className="hover:bg-muted/50 transition-colors">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getRankIcon(entry.rank)}
                                    <span className="font-semibold">#{entry.rank}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                  {entry.player}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="gaming-badge font-mono">
                                    {entry.rating}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {entry.gamesPlayed}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {entry.wins}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {entry.losses}
                                </TableCell>
                                <TableCell>
                                  <span className={`font-medium ${
                                    entry.winRate >= 60 ? 'text-green-500' :
                                    entry.winRate >= 50 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {entry.winRate.toFixed(1)}%
                                  </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {entry.cton}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    asChild
                                    size="sm"
                                    className="bg-[var(--civ3-gold)] text-[var(--civ3-blue)] border border-[var(--civ3-border)] font-bold shadow-md hover:bg-yellow-300 hover:text-[var(--civ3-blue)] focus:ring-2 focus:ring-[var(--civ3-border)] focus:ring-offset-2 transition-colors"
                                  >
                                    <a href={`/CivPlayers-Civ3-League/player/${encodeURIComponent(entry.player)}`}>
                                      View Profile
                                    </a>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Pagination controls */}
                      {filteredAndSortedData.length > ENTRIES_PER_PAGE && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white"
                            disabled={page[mode] === 1}
                            onClick={() => setPage((prev) => ({ ...prev, [mode]: prev[mode] - 1 }))}
                          >
                            Previous
                          </Button>
                          <span className="mx-2 text-sm font-medium text-white">
                            Page {page[mode]} of {Math.ceil(filteredAndSortedData.length / ENTRIES_PER_PAGE)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white"
                            disabled={page[mode] === Math.ceil(filteredAndSortedData.length / ENTRIES_PER_PAGE)}
                            onClick={() => setPage((prev) => ({ ...prev, [mode]: prev[mode] + 1 }))}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                      {filteredAndSortedData.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No players found matching your search.
                        </div>
                      )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Leaderboard;