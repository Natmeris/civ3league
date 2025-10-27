import { useDocumentTitle } from "@/lib/useDocumentTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";
import * as Recharts from "recharts";
import { useState } from "react";
import { ChevronDown, ChevronUp, Trophy, Gamepad2, Award, TrendingUp } from "lucide-react";


const champions = [
  {
    year: 2024,
    name: "Suede",
    standings: ["Suede - 2246", "cheeze - 1963", "rabdag - 1949", "rever - 1832", "Halu - 1814"],
  },
  {
    year: 2023,
    name: "Antiquity",
    standings: ["Antiquity", "rabdag", "rever", "SaberBoothTiger", "kismic"],
  },
  {
    year: 2022,
    name: "Suede",
    standings: ["Suede", "Ironclad/claudia", "ObiwanKenNooby", "cheeze", "Halu"],
  },
  {
    year: 2021,
    name: "Suede",
    standings: [
      "Suede - 9764",
      "Ironclad/claudia - 9537",
      "Halu - 8536",
      "cheeze - 8077",
      "Byzantine Fire - 7947",
    ],
  },
  {
    year: 2020,
    name: "Ironclad/claudia",
    standings: [
      "Ironclad/claudia - 8809",
      "Suede - 8803",
      "Halu - 7781",
      "Byzantine Fire - 7476",
      "Gbiebs - 7912",
    ],
  },
];

const mostGamesByYear = {
  2024: [
    { name: "Halu", games: 495 },
    { name: "Silent Knight", games: 382 },
    { name: "zaxxon", games: 377 },
  ],
  2023: [
    { name: "Silent Knight", games: 728 },
    { name: "Sooty", games: 649 },
    { name: "Lothar", games: 639 },
  ],
  2022: [
    { name: "Luv", games: 724 },
    { name: "maclunkey", games: 708 },
    { name: "Lothar", games: 675 },
  ],
  2021: [
    { name: "Luv", games: 808 },
    { name: "maclunkey", games: 748 },
    { name: "MrBobBacklund", games: 726 },
  ],
};

const mostWinsByYear = {
  2024: [
    { name: "Halu", wins: 230, fill: "#f97316" },
    { name: "Silent Knight", wins: 222, fill: "#06b6d4" },
    { name: "Zardoz", wins: 190, fill: "#8b5cf6" },
    { name: "maclunkey", wins: 175, fill: "#00ff08ff" },
    { name: "zaxxon", wins: 175, fill: "#005c54ff" },
  ],
  2023: [
    { name: "Silent Knight", wins: 349, fill: "#f97316" },
    { name: "Sooty", wins: 332, fill: "#06b6d4" },
    { name: "spirts", wins: 302, fill: "#8b5cf6" },
    { name: "maclunkey", wins: 280, fill: "#ec4899" },
    { name: "Lothar", wins: 273, fill: "#10b981" },
  ],
  2022: [
    { name: "Lothar", wins: 341, fill: "#10b981" },
    { name: "maclunkey", wins: 340, fill: "#ec4899" },
    { name: "Ironclad/claudia", wins: 336, fill: "#f59e0b" },
    { name: "Halu", wins: 333, fill: "#3b82f6" },
    { name: "Silent Knight", wins: 320, fill: "#f97316" },
  ],
  2021: [
    { name: "maclunkey", wins: 383, fill: "#ec4899" },
    { name: "Ironclad/claudia", wins: 367, fill: "#f59e0b" },
    { name: "Luv", wins: 362, fill: "#06b6d4" },
    { name: "Halu", wins: 345, fill: "#3b82f6" },
    { name: "MrBobBacklund", wins: 339, fill: "#8b5cf6" },
  ],
};

const winRateByYear = {
  2024: [
    { name: "rabdag", winRate: 71.2, fill: "#f97316" },
    { name: "Suede", winRate: 64.0, fill: "#06b6d4" },
    { name: "Carlot", winRate: 61.5, fill: "#8b5cf6" },
  ],
  2023: [
    { name: "Antiquity", winRate: 67.9, fill: "#f97316" },
    { name: "Suede", winRate: 67.3, fill: "#06b6d4" },
    { name: "Ragnar Lothbrok", winRate: 61.8, fill: "#8b5cf6" },
  ],
  2022: [
    { name: "ztatiz", winRate: 69, fill: "#10b981" },
    { name: "Antiquity", winRate: 62.07, fill: "#f97316" },
    { name: "cheeze", winRate: 60, fill: "#ec4899" },
  ],
  2021: [
    { name: "cheeze", winRate: 65.3, fill: "#ec4899" },
    { name: "Suede", winRate: 65, fill: "#06b6d4" },
    { name: "Rabbert_Klein", winRate: 61, fill: "#8b5cf6" },
  ],
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1d24] border border-primary/30 rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-semibold mb-1">{label}</p>
        <p className="text-primary font-bold">
          {payload[0].name === 'wins' ? 'Wins' : payload[0].name === 'winRate' ? 'Win Rate' : payload[0].name}: {payload[0].value}{payload[0].name === 'winRate' ? '%' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const HallOfFame = () => {
  useDocumentTitle("Civ 3 League - Hall of Fame");
  const [openYears, setOpenYears] = useState<Record<number, boolean>>({});

  const toggleYear = (year: number) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12">
        <section className="text-center space-y-3 md:space-y-4 px-4 mb-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gradient drop-shadow-sm">Hall of Fame</h1>
          <p className="text-base md:text-xl text-muted-foreground/90 leading-relaxed tracking-wide max-w-4xl mx-auto">Celebrating champions and standout players through the years.</p>
        </section>

        {/* Champions */}
        <Card className="gaming-card">
          <CardHeader className="text-center pb-4 md:pb-6 px-4">
            <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-2 md:mb-3">End of Year Champions</CardTitle>
            <p className="text-base md:text-lg text-muted-foreground/90 tracking-wide">Celebrating our legendary champions through the years</p>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
              {champions.map((c) => {
                const yearKey = Number(c.year);
                const isOpen = openYears[yearKey] === true;
                return (
                  <Card key={yearKey} className="gaming-card overflow-hidden">
                    <CardContent className="p-0">
                      <div
                        onClick={() => toggleYear(yearKey)}
                        className="cursor-pointer p-4 md:p-6 text-center transition-all duration-200 hover:bg-primary/5 select-none"
                        aria-expanded={isOpen}
                        aria-controls={`champion-standings-${yearKey}`}
                      >
                        <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
                          <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                          <span className="text-lg md:text-xl font-bold text-primary">{c.year}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-extrabold text-foreground mb-2 md:mb-3">{c.name}</h3>
                        <div className="flex items-center justify-center text-muted-foreground">
                          <span className="text-xs md:text-sm mr-1">
                            {isOpen ? 'Hide Standings' : 'View Standings'}
                          </span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      
                      <div
                        id={`champion-standings-${yearKey}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                        aria-hidden={!isOpen}
                      >
                        <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 border-t border-border/50">
                          {Array.isArray(c.standings) && c.standings.length > 0 && (
                            <ol className="space-y-2">
                              {c.standings.map((name, idx) => (
                                <li 
                                  key={idx} 
                                  className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground"
                                >
                                  <span className={`flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-xs font-bold ${
                                    idx === 0 
                                      ? 'bg-primary/20 text-primary' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className={idx === 0 ? 'font-semibold text-foreground' : ''}>
                                    {name}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Most Games Played */}
        <Card className="gaming-card">
          <CardHeader className="px-4">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
              <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Most Games Played</CardTitle>
            </div>
            <p className="text-sm md:text-base text-muted-foreground text-center">The most dedicated players by year</p>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {Object.entries(mostGamesByYear).reverse().map(([year, list]) => (
                <div key={year} className="space-y-4">
                  <div className="text-center pb-3 border-b border-primary/30">
                    <h3 className="text-xl md:text-2xl font-bold text-primary">{year}</h3>
                  </div>
                  <div className="space-y-3">
                    {list.map((p, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-bold ${
                            idx === 0 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`font-medium text-sm md:text-base ${idx === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {p.name}
                          </span>
                        </div>
                        <span className="font-bold text-primary text-sm md:text-base">{p.games}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Wins By Year - Bar Charts */}
        <div className="space-y-6">
          <div className="text-center mb-6 md:mb-8 px-4">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-primary">Most Wins By Year</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">Top 5 players with the most victories</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {Object.entries(mostWinsByYear).reverse().map(([year, list]) => (
              <Card key={year} className="gaming-card">
                <CardHeader className="px-4">
                  <CardTitle className="text-center text-xl md:text-2xl text-primary">{year}</CardTitle>
                </CardHeader>
                <CardContent className="px-2 md:px-4">
                  <div className="w-full h-[350px] md:h-[400px] flex items-center justify-center">
                    <Recharts.ResponsiveContainer width="100%" height="100%">
                      <Recharts.BarChart 
                        data={list}
                        margin={{ top: 20, right: 5, left: 0, bottom: 80 }}
                      >
                        <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <Recharts.XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: '#d1d5db', fontSize: 13, fontWeight: 500 }}
                          interval={0}
                        />
                        <Recharts.YAxis 
                          tick={{ fill: '#9ca3af', fontSize: 11 }}
                          width={40}
                        />
                        <Recharts.Tooltip 
                          content={CustomTooltip}
                          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        />
                        <Recharts.Bar 
                          dataKey="wins" 
                          radius={[8, 8, 0, 0]}
                        >
                          {list.map((entry, index) => (
                            <Recharts.Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Recharts.Bar>
                      </Recharts.BarChart>
                    </Recharts.ResponsiveContainer>
                  </div>
                  {/* Custom legend below chart */}
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {list.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></span>
                        <span className="text-sm font-medium text-white">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Win Rate By Year - Line Charts */}
        <div className="space-y-6">
          <div className="text-center mb-6 md:mb-8 px-4">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-primary">Highest Win Rate By Year</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">Top 3 players with the best winning percentage</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {Object.entries(winRateByYear).reverse().map(([year, list]) => {
              // Calculate min and max for dynamic Y-axis
              const minRate = Math.min(...list.map(item => item.winRate));
              const maxRate = Math.max(...list.map(item => item.winRate));
              const padding = 5; // Add some padding
              const yMin = Math.max(0, Math.floor(minRate - padding));
              const yMax = Math.min(100, Math.ceil(maxRate + padding));
              
              return (
                <Card key={year} className="gaming-card">
                  <CardHeader className="px-4">
                    <CardTitle className="text-center text-xl md:text-2xl text-primary">{year}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 md:px-4">
                    <div className="w-full h-[350px] md:h-[400px] flex items-center justify-center">
                      <Recharts.ResponsiveContainer width="100%" height="100%">
                        <Recharts.LineChart 
                          data={list}
                          margin={{ top: 20, right: 5, left: 0, bottom: 80 }}
                        >
                          <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <Recharts.XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fill: '#d1d5db', fontSize: 13, fontWeight: 500 }}
                            interval={0}
                          />
                          <Recharts.YAxis 
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            domain={[yMin, yMax]}
                            width={40}
                          />
                          <Recharts.Tooltip 
                            content={CustomTooltip}
                          />
                          {/* No built-in legend, use custom below chart */}
                          <Recharts.Line 
                            type="monotone"
                            dataKey="winRate" 
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={{ r: 6, strokeWidth: 2 }}
                            activeDot={{ r: 8 }}
                          >
                            {list.map((entry, index) => (
                              <Recharts.Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                            ))}
                          </Recharts.Line>
                        </Recharts.LineChart>
                      </Recharts.ResponsiveContainer>
                    </div>
                    {/* Custom legend below chart: Name - value, no color */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {list.map((entry) => (
                        <span key={entry.name} className="text-sm font-medium text-white">
                          {entry.name} - {entry.winRate}%
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HallOfFame;