import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";

interface Tactic {
  title: string;
  description: string;
  exceptions?: string[];
  enforcementNotes?: string;
}

interface BannedTacticsData {
  title: string;
  introduction: string;
  tactics: Tactic[];
  additionalNote: string;
}

const BannedTactics = () => {
  useDocumentTitle("Civ 3 League - Banned Tactics");
  const [data, setData] = useState<BannedTacticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/banned-tactics.json?v=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error('Failed to fetch banned tactics');
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading banned-tactics.json', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load banned tactics');
          setLoading(false);
        }
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
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Banned Tactics & Prohibited Actions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The following tactics and actions are not allowed in Civ 3 League competitions.
          </p>
        </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading banned tactics...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error: {error}</p>
              </div>
            ) : data ? (
              <div className="space-y-8">
                {/* Introduction */}
                <Card className="gaming-card border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                      <p className="text-lg text-foreground leading-relaxed">
                        {data.introduction}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Banned Tactics */}
                <div className="space-y-6">
                  {data.tactics.map((tactic, index) => (
                    <Card key={index} className="gaming-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          {tactic.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-foreground leading-relaxed">
                          {tactic.description}
                        </p>

                        {tactic.exceptions && tactic.exceptions.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-green-500/50 bg-green-500/5 rounded">
                            <h4 className="font-semibold text-green-500 mb-2">Exceptions:</h4>
                            <ul className="space-y-2">
                              {tactic.exceptions.map((exception, eIdx) => (
                                <li key={eIdx} className="text-sm text-foreground flex gap-2">
                                  <span className="text-green-500 flex-shrink-0">✓</span>
                                  <span>{exception}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {tactic.enforcementNotes && (
                          <div className="mt-4 pl-4 border-l-2 border-blue-500/50 bg-blue-500/5 rounded">
                            <div className="flex gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-foreground">
                                <span className="font-semibold text-blue-500">Enforcement Note: </span>
                                {tactic.enforcementNotes}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Additional Note */}
                <Card className="gaming-card border-amber-500/30 bg-amber-500/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                      <p className="text-foreground leading-relaxed">
                        <span className="font-semibold text-amber-500">Additional Note: </span>
                        {data.additionalNote}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default BannedTactics;
