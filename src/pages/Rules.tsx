import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, AlertTriangle, Clock, Swords, FileWarning, BookOpen, MessageSquare } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState, ComponentType } from "react";

const Rules = () => {
  useDocumentTitle("Civ 3 League - Ladder Rules");

  type RuleCategory = {
    icon: string;
    title: string;
    rules: string[];
  };

  const [ruleCategories, setRuleCategories] = useState<RuleCategory[]>([]);

  const iconsMap: Record<string, ComponentType<{ className?: string }>> = {
    Shield,
    Users,
    AlertTriangle,
    Clock,
    Swords,
    FileWarning,
    BookOpen,
    MessageSquare,
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Add cache-busting timestamp to force fresh data
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/rules.json?v=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error('Failed to fetch rules');
        const json = await res.json();
        if (!cancelled) setRuleCategories(json);
      } catch (err) {
        console.error('Error loading rules.json', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient mb-6 drop-shadow-sm">
            Ladder Rules & Guidelines
          </h1>
          <p className="text-xl leading-relaxed tracking-wide max-w-3xl mx-auto" style={{ color: '#fff' }}>
            Official rules and guidelines for competitive play in the Civ3 League. Please read carefully to ensure fair and enjoyable matches for all players.
          </p>
        </div>

        {/* Rules Sections */}
        <div className="space-y-8 mb-12">
          {ruleCategories.map((category, index) => {
            const IconComponent = iconsMap[category.icon] || Shield;
            return (
              <Card key={index} className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-3 text-2xl tracking-tight">
                    <IconComponent className="w-7 h-7 text-primary" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {category.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start gap-4">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                        <span className="flex-1 leading-relaxed tracking-normal" style={{ fontSize: '1.05rem', color: '#fff' }}>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="gaming-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Rules?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you have any questions or need clarification on these rules, contact a moderator or admin.
              The goal is to ensure fair and enjoyable competitive play for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:suedeciviii@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Admin Team
              </a>
              <a
                href="https://discord.gg/teVt5pt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Ask on Discord
              </a>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Rules;
