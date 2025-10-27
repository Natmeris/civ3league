import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Users,
  Zap,
  Clock,
  Sword,
  Flame,
  Map,
  Star,
  FileText,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Modes = () => {
  useDocumentTitle("Civ 3 League - Game Modes");

  const mainModes = [
    {
      icon: Globe,
      title: "Multiplayer Tournament (MPT)",
      description: `MPT was once the most popular mode in the Civ3 League during the old ladder days and has recently exploded in popularity. It is a tiny map, usually played almost exclusively as 4v4 (otherwise the map template is too big), and with only ancient Unique Unit (UU) civilizations. There are small tweaks to civ balance, and map/contact trading is available at map making. Aside from that, this is Civ 3 at its purest.`,
      details: [
        "Emphasizes early UU rushes and limited teching in the ancient era.",
        "1 City Elimination — expansion and attacks are high-risk, high-reward.",
        "Fastest mod: roughly 2 hours per full match.",
      ],
    },
    {
      icon: Sword,
      title: "Future",
      description: `Future is a late-era mode played in teams, featuring minimal tech research and heavy strategic flexibility. It uses vanilla Civ’s growth and production systems but introduces many small changes for balance and pacing.`,
      details: [
        "Little to no tech research required; players set science to 0%.",
        "Gold can be used for happiness, rushing, or drafting large armies.",
        "Supports both wide empires and tall megacities.",
        "Features complex modern warfare: land, air, and naval combat.",
        "Paratroopers and cruise missiles become strong, viable units.",
        "Played with Regicide: lose your king and you die.",
      ],
    },
    {
      icon: Zap,
      title: "Modern",
      description: `Modern is a 2020-era mod featuring the most changes from vanilla Civ 3, but with simple mechanics that are easy to learn. It offers accelerated starts, reduced RNG, and strong focus on map control and resource management.`,
      details: [
        "Starts with 2 settlers, 2 workers, an explorer, and built-in granary/aqueduct.",
        "Industrial and modern units unlock progressively through the tech tree.",
        "All civs have the same traits — less RNG, more fairness.",
        "4 playable governments, each with unique buildings and wonders.",
        "Faster gameplay: about 2.5 hours per match.",
        "Optional custom scenario adds animations and a Civilopedia.",
        "If not installed, the mod remains fully playable but visuals may differ.",
        "Scenario files and BIQ available in the community Google Drive.",
      ],
    },
    {
      icon: Clock,
      title: "Quick Civ (QC)",
      description: `QC is a time-limited mode (74 turns) often played as 3v3 or 4v4. It’s the most complete multiplayer Civ experience, combining economy, tech, production, and combat in a fast-paced format.`,
      details: [
        "Growth speeds doubled; production costs halved.",
        "2 City Elimination rule.",
        "Requires full teching to 2nd era to stay competitive.",
        "Players must balance science, gold, military, and expansion.",
        "Each team member contributes strategically toward victory.",
        "Average game length: under 3 hours.",
      ],
    },
    {
      icon: Star,
      title: "Medieval Japan (MDJ)",
      description: `MDJ is a unique mode set in the Medieval era, featuring only Japanese civilizations and a custom map. It emphasizes samurai warfare, feudal strategy, and resourceful play. The mode is fast-paced and rewards both aggression and clever defense.`,
      details: [
        "All players use Japanese civs with unique samurai units.",
        "Custom map designed for balanced feudal warfare.",
        "Focus on medieval techs, castles, and resource control.",
        "Short, intense matches with high replay value.",
        "Ideal for players who enjoy tactical combat and quick decision-making.",
      ],
    },
    {
      icon: Users,
      title: "MediMPT",
      description: `MediMPT is a Medieval-era team mode that blends the classic MPT format with a focus on knights, castles, and feudal economies. It’s played on a tiny map with medieval civs and features unique balance changes for this era.`,
      details: [
        "Teams compete using only medieval-era civilizations.",
        "Tiny map for fast-paced, high-stakes action.",
        "Unique unit and tech balance for the medieval period.",
        "Emphasis on teamwork, castle building, and knight warfare.",
        "Matches are quick (about 2 hours) and highly strategic.",
      ],
    },
  ];

  const lesserModes = [
    {
      icon: Flame,
      title: "UU Madness",
      description: `A chaotic mode where all UUs in the game are buildable if you control the right luxury or bonus resource.`,
      details: [
        "Can be played as teams or CTON (free-for-all with no comms).",
        "1 City Elimination rule applies.",
        "Can be scored on the MPT (ancient) ladder.",
      ],
    },
    {
      icon: Map,
      title: "Epic",
      description: `Essentially accelerated-production Civ 3 on a normal-size map — pure madness.`,
      details: [
        "Games may last 6+ hours.",
        "Usually non-ladder, but can be scored as MPT if all agree beforehand.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gradient mb-6 tracking-tight">
            Our Game Modes
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-8" style={{ color: '#fff' }}>
            The CivPlayers Civ3 League offers a variety of multiplayer modes — from
            ancient-era skirmishes to futuristic total wars. Each mode provides a
            unique strategic experience suited for different playstyles and time
            commitments.
          </p>
        </div>

        {/* Main Modes */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center tracking-tight">
            Main Ladder Modes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {mainModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Card key={index} className="gaming-card flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Icon className="w-7 h-7 text-primary" />
                      {mode.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <p className="leading-7 text-[1.05rem]" style={{ color: '#fff' }}>
                      {mode.description}
                    </p>
                    <ul className="list-disc list-inside space-y-2" style={{ color: '#fff' }}>
                      {mode.details.map((d, i) => (
                        <li key={i} className="leading-7">{d}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="my-16" />

        {/* Lesser Modes */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center tracking-tight">
            Lesser Modes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {lesserModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Card key={index} className="gaming-card flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Icon className="w-7 h-7 text-primary" />
                      {mode.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <p className="leading-7 text-[1.05rem]" style={{ color: '#fff' }}>
                      {mode.description}
                    </p>
                    <ul className="list-disc list-inside space-y-2" style={{ color: '#fff' }}>
                      {mode.details.map((d, i) => (
                        <li key={i} className="leading-7">{d}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Google Drive Link */}
        <Card className="gaming-card text-center">
          <CardContent className="p-8">
            <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground tracking-tight">
              Mod Files & Resources
            </h3>
            <p className="mb-4 text-lg leading-7" style={{ color: '#fff' }}>
              The Google Drive for all official mods, BIQs, and map grids can be found here:
            </p>
            <a
              href="https://drive.google.com/drive/folders/1f3L7-nWk-KRPoc9oU4hrX8bYOoNsoZY7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Access Google Drive
            </a>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Modes;
