import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ComparePlayers from "@/components/ComparePlayers";
import { fetchModeData, GameMode, LeaderboardEntry } from "@/lib/leaderboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, LineChart as LineChartIcon, PieChart, Target, Activity, Radar } from "lucide-react";
import * as Recharts from "recharts";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

type ChartType = "bar" | "line" | "area" | "radar" | "pie" | "scatter";

const PLAYER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#f97316', // orange
  '#a3e635', // lime
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1d24] border border-green-500/50 rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="text-green-400 font-bold">{Number(entry.value).toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ChartTypeSelector = ({ 
  value, 
  onChange, 
  title 
}: { 
  value: ChartType; 
  onChange: (type: ChartType) => void;
  title: string;
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <div className="flex gap-2 flex-wrap">
      <Button
        variant={value === "bar" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("bar")}
        className={value === "bar" ? "bg-primary text-white" : "text-foreground hover:text-primary hover:bg-green-500/10"}
        title="Bar Chart"
      >
        <BarChart3 className="w-4 h-4" />
      </Button>
      <Button
        variant={value === "line" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("line")}
        className={value === "line" ? "bg-primary text-white" : "text-foreground hover:text-primary hover:bg-green-500/10"}
        title="Line Chart"
      >
        <LineChartIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={value === "area" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("area")}
        className={value === "area" ? "bg-primary text-white" : "text-foreground hover:text-primary hover:bg-green-500/10"}
        title="Area Chart"
      >
        <Activity className="w-4 h-4" />
      </Button>
      <Button
        variant={value === "radar" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("radar")}
        className={value === "radar" ? "bg-primary text-white" : "text-foreground hover:text-primary hover:bg-green-500/10"}
        title="Radar Chart (Bulls Eye)"
      >
        <Target className="w-4 h-4" />
      </Button>
      <Button
        variant={value === "pie" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("pie")}
        className={value === "pie" ? "bg-primary text-white" : "text-foreground hover:text-primary hover:bg-green-500/10"}
        title="Pie Chart"
      >
        <PieChart className="w-4 h-4" />
      </Button>
      <Button
        variant={value === "scatter" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("scatter")}
        className={value === "scatter" ? "bg-primary text-white" : "text-foreground hover:text-primary hover:bg-green-500/10"}
        title="Scatter Plot"
      >
        <Radar className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const DynamicChart = ({
  title,
  modes,
  players,
  valueFor,
  chartType,
  onChartTypeChange,
}: {
  title: string;
  modes: GameMode[];
  players: string[];
  valueFor: (p: string, m: GameMode) => number;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}) => {
  const chartData = modes.map((mode) => {
    const dataPoint: any = { mode };
    players.forEach((player) => {
      dataPoint[player] = valueFor(player, mode);
    });
    return dataPoint;
  });

  // For pie chart - aggregate total values per player
  const pieData = players.map((player, idx) => ({
    name: player,
    value: modes.reduce((sum, mode) => sum + valueFor(player, mode), 0),
    fill: PLAYER_COLORS[idx % PLAYER_COLORS.length]
  }));

  // For scatter - convert to x,y format
  const scatterData = players.map((player, idx) => ({
    player,
    data: modes.map((mode, modeIdx) => ({
      x: modeIdx,
      y: valueFor(player, mode),
      mode
    })),
    color: PLAYER_COLORS[idx % PLAYER_COLORS.length]
  }));

  return (
    <Card className="gaming-card mb-6">
      <CardContent className="p-6">
        <ChartTypeSelector value={chartType} onChange={onChartTypeChange} title={title} />
        
        <div className="w-full h-[350px] md:h-[450px]">
          <Recharts.ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <Recharts.BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <Recharts.XAxis 
                  dataKey="mode" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: '#d1d5db', fontSize: 13 }}
                />
                <Recharts.YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Recharts.Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                
                {players.map((player, idx) => (
                  <Recharts.Bar 
                    key={player}
                    dataKey={player}
                    fill={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </Recharts.BarChart>
            ) : chartType === "line" ? (
              <Recharts.LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <Recharts.XAxis 
                  dataKey="mode" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: '#d1d5db', fontSize: 13 }}
                />
                <Recharts.YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Recharts.Tooltip content={CustomTooltip} />
                
                {players.map((player, idx) => (
                  <Recharts.Line 
                    key={player}
                    type="monotone"
                    dataKey={player}
                    stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 5, strokeWidth: 2, fill: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                    activeDot={{ r: 8, fill: '#10b981', stroke: PLAYER_COLORS[idx % PLAYER_COLORS.length], strokeWidth: 2 }}
                  />
                ))}
              </Recharts.LineChart>
            ) : chartType === "area" ? (
              <Recharts.AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <Recharts.XAxis 
                  dataKey="mode" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: '#d1d5db', fontSize: 13 }}
                />
                <Recharts.YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Recharts.Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                
                {players.map((player, idx) => (
                  <Recharts.Area 
                    key={player}
                    type="monotone"
                    dataKey={player}
                    stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                    fill={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                ))}
              </Recharts.AreaChart>
            ) : chartType === "radar" ? (
              <Recharts.RadarChart data={chartData} margin={{ top: 20, right: 60, left: 60, bottom: 20 }}>
                <Recharts.PolarGrid stroke="rgba(255,255,255,0.2)" />
                <Recharts.PolarAngleAxis 
                  dataKey="mode" 
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                />
                <Recharts.PolarRadiusAxis 
                  angle={90} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Recharts.Tooltip content={CustomTooltip} />
                
                {players.map((player, idx) => (
                  <Recharts.Radar 
                    key={player}
                    name={player}
                    dataKey={player}
                    stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                    fill={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                ))}
              </Recharts.RadarChart>
            ) : chartType === "pie" ? (
              <Recharts.PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <Recharts.Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Recharts.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Recharts.Pie>
                <Recharts.Tooltip content={CustomTooltip} />
                
              </Recharts.PieChart>
            ) : (
              <Recharts.ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <Recharts.XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Mode"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'Mode Index', position: 'bottom', fill: '#9ca3af' }}
                />
                <Recharts.YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Value"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Recharts.Tooltip content={CustomTooltip} cursor={{ strokeDasharray: '3 3', stroke: '#10b981' }} />
                
                {scatterData.map((playerData, idx) => (
                  <Recharts.Scatter
                    key={playerData.player}
                    name={playerData.player}
                    data={playerData.data}
                    fill={playerData.color}
                  />
                ))}
              </Recharts.ScatterChart>
            )}
          </Recharts.ResponsiveContainer>
        </div>

        {/* Player Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border/50">
          {players.map((player, idx) => (
            <div key={player} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
              />
              <span className="text-sm font-medium text-foreground">{player}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ComparePage = () => {
  useDocumentTitle("Compare Players - Civ 3 League");
  const [search] = useSearchParams();
  const playersParam = search.get('players') || '';
  const initialPlayers = playersParam ? playersParam.split(',').map(p=>decodeURIComponent(p).trim()).filter(Boolean) : [];

  const modes: GameMode[] = ["Overall","MPT","Modern","FUT","QC","MDJ","UU","CW"];
  const [modeData, setModeData] = useState<Record<GameMode, LeaderboardEntry[]>>({} as any);
  const [loading, setLoading] = useState(true);
  const [currentPlayers, setCurrentPlayers] = useState<string[]>(initialPlayers);

  // Chart type state for each metric
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({
    wins: 'bar',
    losses: 'bar',
    games: 'area',
    winRate: 'line',
    rating: 'radar',
  });

  useEffect(()=>{
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const mapped: Record<GameMode, LeaderboardEntry[]> = {} as any;
      await Promise.all(modes.map(async (m)=>{
        try{ mapped[m]=await fetchModeData(m);}catch{ mapped[m]=[]; }
      }));
      if (!cancelled) setModeData(mapped);
      if (!cancelled) setLoading(false);
    };
    load();
    return ()=>{ cancelled = true; };
  }, []);

  // Watch for changes in the ComparePlayers component
  useEffect(() => {
    const newPlayers = playersParam ? playersParam.split(',').map(p=>decodeURIComponent(p).trim()).filter(Boolean) : [];
    setCurrentPlayers(newPlayers);
  }, [playersParam]);

  const playerStats = useMemo(()=>{
    const out: Record<string, Record<GameMode, LeaderboardEntry | null>> = {} as any;
    for (const p of currentPlayers) {
      out[p] = {} as any;
      for (const m of modes) {
        out[p][m] = (modeData[m]||[]).find(e=>e.player.trim().toLowerCase()===p.trim().toLowerCase()) || null;
      }
    }
    return out;
  }, [currentPlayers, modeData]);

  const setChartType = (metric: string, type: ChartType) => {
    setChartTypes(prev => ({ ...prev, [metric]: type }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <Button variant="outline" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
            <Link to="/leaderboard">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leaderboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gradient">Compare Players</h1>
          </div>
          <div className="md:w-32" />
        </div>

        <Card className="gaming-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Player Selection</CardTitle>
            <p className="text-sm text-muted-foreground">Add or remove players to compare their stats across different game modes</p>
          </CardHeader>
          <CardContent>
            <ComparePlayers initial={initialPlayers} showTable={false} onPlayersChange={(p)=>setCurrentPlayers(p)} />
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Loading player data...</div>
          </div>
        )}

        {!loading && currentPlayers.length === 0 && (
          <Card className="gaming-card">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No players selected</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Add players above to start comparing their statistics
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && currentPlayers.length > 0 && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Players Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {currentPlayers.map((player, idx) => (
                    <Badge 
                      key={player}
                      variant="outline" 
                      className="text-base px-4 py-2"
                      style={{ 
                        backgroundColor: `${PLAYER_COLORS[idx % PLAYER_COLORS.length]}20`,
                        borderColor: PLAYER_COLORS[idx % PLAYER_COLORS.length],
                        color: PLAYER_COLORS[idx % PLAYER_COLORS.length]
                      }}
                    >
                      {player}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Chart */}
            <DynamicChart
              title="Rating Comparison"
              modes={modes}
              players={currentPlayers}
              valueFor={(p, m) => (playerStats[p]?.[m]?.rating || 0)}
              chartType={chartTypes.rating}
              onChartTypeChange={(type) => setChartType('rating', type)}
            />

            {/* Wins Chart */}
            <DynamicChart
              title="Wins by Mode"
              modes={modes}
              players={currentPlayers}
              valueFor={(p, m) => (playerStats[p]?.[m]?.wins || 0)}
              chartType={chartTypes.wins}
              onChartTypeChange={(type) => setChartType('wins', type)}
            />

            {/* Losses Chart */}
            <DynamicChart
              title="Losses by Mode"
              modes={modes}
              players={currentPlayers}
              valueFor={(p, m) => (playerStats[p]?.[m]?.losses || 0)}
              chartType={chartTypes.losses}
              onChartTypeChange={(type) => setChartType('losses', type)}
            />

            {/* Games Played Chart */}
            <DynamicChart
              title="Games Played by Mode"
              modes={modes}
              players={currentPlayers}
              valueFor={(p, m) => (playerStats[p]?.[m]?.gamesPlayed || 0)}
              chartType={chartTypes.games}
              onChartTypeChange={(type) => setChartType('games', type)}
            />

            {/* Win Rate Chart */}
            <DynamicChart
              title="Win Rate Across Modes (%)"
              modes={modes}
              players={currentPlayers}
              valueFor={(p, m) => (playerStats[p]?.[m]?.winRate || 0)}
              chartType={chartTypes.winRate}
              onChartTypeChange={(type) => setChartType('winRate', type)}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ComparePage;