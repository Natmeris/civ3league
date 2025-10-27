export interface LeaderboardEntry {
  rank: number;
  player: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  cton: number;
}

export type GameMode = "Overall" | "MPT" | "Modern" | "FUT" | "QC" | "MDJ" | "UU" | "CW";

export const PUBLISHED_DOC_ID = "2PACX-1vQFHhHo2i43HoPGGonyLAiCzV7q-P_RB27oMS1eD0qWi72XGE5EqV33XpkS7Zi01F3dyCkO2I-TP9OE";
export const SHEET_GIDS: Record<GameMode, string> = {
  Overall: "244794390",
  MPT: "644059342",
  Modern: "715002767",
  FUT: "1605870438",
  QC: "1291609339",
  MDJ: "1937906358",
  UU: "1738898411",
  CW: "1855555132",
};

// Copied from src/components/home/Leaderboard.tsx to ensure identical behavior
export function parseCSV(csv: string): LeaderboardEntry[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  const parseRow = (line: string): string[] => {
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
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map(s => s.trim().replace(/^"|"$/g, ''));
  };

  let headerIdx = 0;
  let headerCells: string[] = parseRow(lines[0]);
  const normalized = (arr: string[]) => arr.map(s => s.toLowerCase().replace(/\s+/g, ''));

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
    if (winRate > 0 && winRate <= 1) {
      winRate = winRate * 100;
    }

    const cton = idxCTON >= 0 ? toInt(row[idxCTON], 0) : 0;
    const rank = idxRank >= 0 ? toInt(row[idxRank], results.length + 1) : results.length + 1;

    results.push({ rank, player, rating, gamesPlayed, wins, losses, winRate, cton });
  }

  return results;
}

export async function fetchModeData(mode: GameMode): Promise<LeaderboardEntry[]> {
  const gid = SHEET_GIDS[mode];
  const csvUrl = `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_DOC_ID}/pub?output=csv&gid=${gid}`;
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const csvText = await response.text();
  const data = parseCSV(csvText);
  if (data.length === 0) {
    throw new Error('No data found in sheet');
  }
  return data;
}
