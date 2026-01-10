import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCategory {
  title: string;
  leaders: Array<{
    rank: number;
    player: string;
    value: string;
  }>;
}

interface FinalWinner {
  rank: number;
  player: string;
  rating: number;
  icon: any;
  color: string;
}

const SeasonOverview = () => {
  const [finalWinners, setFinalWinners] = useState<FinalWinner[]>([]);
  const iconMap: Record<number, any> = {
    1: Trophy,
    2: Medal,
    3: Medal,
    4: Target,
    5: Target,
  };
  const colorMap: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-600",
    4: "text-blue-500",
    5: "text-green-500",
  };

  const [stats, setStats] = useState<StatCategory[]>([
    {
      title: "Most Games Played",
      leaders: [
        { rank: 1, player: "Halu", value: "492" },
        { rank: 2, player: "Silent Knight", value: "382" },
        { rank: 3, player: "zaxxon", value: "374" },
      ]
    },
    {
      title: "Most Wins",
      leaders: [
        { rank: 1, player: "Halu", value: "229" },
        { rank: 2, player: "Silent Knight", value: "222" },
        { rank: 3, player: "Zardoz", value: "190" },
      ]
    },
    {
      title: "Highest Win Rate",
      leaders: [
        { rank: 1, player: "rabdag", value: "71.2%" },
        { rank: 2, player: "Suede", value: "64.0%" },
        { rank: 3, player: "Carlot", value: "61.5%" },
      ]
    }
  ]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/leaderboard-stats.json?v=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error('Failed to fetch leaderboard stats');
        const json = await res.json();
        if (!cancelled) {
          setStats(Array.isArray(json) ? json : []);
          
          // Extract final winners from Overall Rating data
          if (Array.isArray(json) && json.length > 0) {
            const overallRating = json.find((cat: StatCategory) => cat.title === "Overall Rating");
            if (overallRating && overallRating.leaders) {
              const winners = overallRating.leaders.map((leader: any) => ({
                rank: leader.rank,
                player: leader.player,
                rating: parseInt(leader.value, 10),
                icon: iconMap[leader.rank] || Trophy,
                color: colorMap[leader.rank] || "text-white",
              }));
              setFinalWinners(winners);
            }
          }
        }
      } catch (err) {
        console.error('Error loading leaderboard-stats.json', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            2025 Season Overview
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Celebrating our top competitors and their achievements throughout the season
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {/* Final Rating Winners */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Final Player Rating Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {finalWinners.map((winner) => {
                  const IconComponent = winner.icon;
                  return (
                    <div key={winner.rank} className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50 text-center">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={`w-5 h-5 ${winner.color}`} />
                        <span className="font-semibold text-lg">#{winner.rank}</span>
                      </div>
                      <span className="font-medium text-foreground mb-2">{winner.player}</span>
                      <Badge variant="secondary" className="gaming-badge">
                        {winner.rating} pts
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Season Statistics - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stat.leaders.map((leader, leaderIndex) => {
                      // Format value with appropriate suffix based on stat type
                      let formattedValue = leader.value;
                      if (stat.title === "Most Games") {
                        formattedValue = `${leader.value} games`;
                      } else if (stat.title === "Most Wins") {
                        formattedValue = `${leader.value} wins`;
                      }
                      
                      return (
                        <div key={leaderIndex} className="flex justify-between items-center p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{leader.rank}</Badge>
                            <span className="text-foreground font-medium">{leader.player}</span>
                          </div>
                          <span className="text-muted-foreground font-semibold">{formattedValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonOverview;