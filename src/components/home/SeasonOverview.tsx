import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Target, TrendingUp } from "lucide-react";

const SeasonOverview = () => {
  const finalWinners = [
    { rank: 1, player: "Suede", rating: 2246, icon: Trophy, color: "text-yellow-500" },
    { rank: 2, player: "cheeze", rating: 1963, icon: Medal, color: "text-gray-400" },
    { rank: 3, player: "rabdag", rating: 1949, icon: Medal, color: "text-amber-600" },
    { rank: 4, player: "rever", rating: 1832, icon: Target, color: "text-blue-500" },
    { rank: 5, player: "Halu", rating: 1814, icon: Target, color: "text-green-500" },
  ];

  const stats = [
    {
      title: "Most Games Played",
      leaders: [
        { player: "Halu", value: "492 games" },
        { player: "Silent Knight", value: "382 games" },
        { player: "zaxxon", value: "374 games" },
      ]
    },
    {
      title: "Most Wins",
      leaders: [
        { player: "Halu", value: "229 wins" },
        { player: "Silent Knight", value: "222 wins" },
        { player: "Zardoz", value: "190 wins" },
      ]
    },
    {
      title: "Highest Win Rate",
      leaders: [
        { player: "rabdag", value: "71.2%" },
        { player: "Suede", value: "64.0%" },
        { player: "Carlot", value: "61.5%" },
      ]
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            2024 Season Overview
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Celebrating our top competitors and their achievements throughout the season
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Final Rating Winners */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Final Player Rating Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {finalWinners.map((winner) => {
                  const IconComponent = winner.icon;
                  return (
                    <div key={winner.rank} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-5 h-5 ${winner.color}`} />
                          <span className="font-semibold text-lg">#{winner.rank}</span>
                        </div>
                        <span className="font-medium text-foreground">{winner.player}</span>
                      </div>
                      <Badge variant="secondary" className="gaming-badge">
                        {winner.rating} pts
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Season Statistics */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Season Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-primary mb-3">{stat.title}</h4>
                    <div className="space-y-2">
                      {stat.leaders.map((leader, leaderIndex) => (
                        <div key={leaderIndex} className="flex justify-between items-center">
                          <span className="text-foreground">{leader.player}</span>
                          <span className="text-muted-foreground font-medium">{leader.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Season Summary */}
        <Card className="gaming-card">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-4">
              2024 Season Highlights
            </h3>
            <p className="text-white leading-relaxed max-w-3xl mx-auto">
              The 2024 season showcased incredible competition with over 50 active players participating 
              in hundreds of matches. Suede claimed the top spot with an impressive 2246 rating, 
              while Halu demonstrated remarkable dedication with 492 games played and 229 victories. 
              The season featured multiple tournaments, special events, and countless strategic battles 
              that pushed players to their limits.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SeasonOverview;