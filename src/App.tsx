import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  getCopilotMetrics,
  getCopilotSeats,
  type CopilotMetricsResponse,
  type CopilotSeatsResponse,
} from "@/lib/copilot-api";

function App() {
  const [metricsData, setMetricsData] = useState<CopilotMetricsResponse[] | null>(null);
  const [seatsData, setSeatsData] = useState<CopilotSeatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [metrics, seats] = await Promise.all([
          getCopilotMetrics(),
          getCopilotSeats(),
        ]);
        setMetricsData(metrics);
        setSeatsData(seats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary rounded-xl">
              <Sparkle weight="fill" className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Copilot Value Explorer
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            GitHub Enterprise: <span className="font-semibold text-foreground">Octodemo</span>
          </p>
        </motion.header>

        {error && (
          <Card className="border-destructive bg-destructive/10 mb-8">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-display font-semibold">
                  Copilot Metrics (Raw JSON)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                    {JSON.stringify(metricsData, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-display font-semibold">
                  Copilot Seats (Raw JSON)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                    {JSON.stringify(seatsData, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
