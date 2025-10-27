import { useDocumentTitle } from "@/lib/useDocumentTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SeasonOverview from "@/components/home/SeasonOverview";
import Leaderboard from "@/components/home/Leaderboard";
import TeamGenerator from "@/components/home/TeamGenerator";

const Index = () => {
  useDocumentTitle("CivPlayers Civ3 League");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <SeasonOverview />
        <Leaderboard />
        <TeamGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
