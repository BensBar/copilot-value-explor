import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Armchair,
  CheckCircle,
  TrendUp,
  TrendDown,
  Sparkle,
  ChartLineUp,
} from "@phosphor-icons/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  fetchCopilotData,
  getAdoptionStatus,
  type CopilotMetrics,
} from "@/lib/copilot-api";

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  suffix = "",
  delay = 0,
  isLoading = false,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  suffix?: string;
  delay?: number;
  isLoading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase font-sans">
            {title}
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" weight="duotone" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold font-display tracking-tight text-foreground">
                {value}
                {suffix}
              </span>
              {trend !== undefined && (
                <span
                  className={`flex items-center gap-1 text-sm font-medium pb-1 ${
                    trend >= 0 ? "text-accent" : "text-destructive"
                  }`}
                >
                  {trend >= 0 ? (
                    <TrendUp weight="bold" className="h-4 w-4" />
                  ) : (
                    <TrendDown weight="bold" className="h-4 w-4" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AdoptionAssessment({
  activeUsers,
  totalSeats,
  isLoading,
}: {
  activeUsers: number;
  totalSeats: number;
  isLoading: boolean;
}) {
  const { status, ratio } = getAdoptionStatus(activeUsers, totalSeats);

  const statusConfig = {
    Strong: {
      color: "bg-accent text-accent-foreground",
      description:
        "Your team is leveraging Copilot effectively. Most seats are actively being used.",
      recommendation: "Continue monitoring and share best practices across teams.",
    },
    Moderate: {
      color: "bg-chart-3 text-foreground",
      description:
        "There's room to improve Copilot adoption across your organization.",
      recommendation:
        "Consider additional training sessions and identifying adoption blockers.",
    },
    Underutilized: {
      color: "bg-destructive text-destructive-foreground",
      description:
        "Copilot seats are significantly underutilized. Many licenses are not being used.",
      recommendation:
        "Review seat assignments and implement an adoption campaign.",
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
            <Sparkle weight="duotone" className="h-5 w-5 text-primary" />
            Adoption Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Badge className={`text-base px-4 py-1.5 font-semibold ${config.color}`}>
                    {status}
                  </Badge>
                </motion.div>
                <span className="text-2xl font-display font-bold text-foreground">
                  {ratio}%
                </span>
                <span className="text-muted-foreground">utilization rate</span>
              </div>
              <p className="text-foreground leading-relaxed">{config.description}</p>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-secondary-foreground">
                  <span className="font-semibold">Recommendation:</span>{" "}
                  {config.recommendation}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AcceptanceRateChart({
  data,
  isLoading,
}: {
  data: { date: string; rate: number }[];
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
            <ChartLineUp weight="duotone" className="h-5 w-5 text-primary" />
            Daily Acceptance Rate (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.9 0.01 250)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="oklch(0.5 0.02 250)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.5 0.02 250)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0.01 250)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number) => [`${value}%`, "Acceptance Rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="oklch(0.45 0.15 250)"
                    strokeWidth={3}
                    dot={{ fill: "oklch(0.45 0.15 250)", strokeWidth: 2, r: 5 }}
                    activeDot={{
                      r: 7,
                      fill: "oklch(0.45 0.15 250)",
                      stroke: "oklch(1 0 0)",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function App() {
  const [metrics, setMetrics] = useState<CopilotMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchCopilotData();
      setMetrics(data);
      setIsLoading(false);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <MetricCard
            title="Active Users"
            value={metrics?.activeUsers ?? 0}
            icon={Users}
            delay={0.1}
            isLoading={isLoading}
          />
          <MetricCard
            title="Total Seats"
            value={metrics?.totalSeats ?? 0}
            icon={Armchair}
            delay={0.15}
            isLoading={isLoading}
          />
          <MetricCard
            title="Acceptance Rate"
            value={metrics?.acceptanceRate ?? 0}
            suffix="%"
            icon={CheckCircle}
            delay={0.2}
            isLoading={isLoading}
          />
          <MetricCard
            title="7-Day Trend"
            value={metrics?.usageTrend ?? 0}
            suffix="%"
            icon={TrendUp}
            trend={metrics?.usageTrend}
            delay={0.25}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AcceptanceRateChart
            data={metrics?.dailyAcceptanceRates ?? []}
            isLoading={isLoading}
          />
          <AdoptionAssessment
            activeUsers={metrics?.activeUsers ?? 0}
            totalSeats={metrics?.totalSeats ?? 0}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
