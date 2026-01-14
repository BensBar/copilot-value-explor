import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sparkle,
  Users,
  ChartLineUp,
  Code,
  ChatCircle,
  GitPullRequest,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  getCopilotMetrics,
  getCopilotSeats,
  getAdoptionStatus,
  type CopilotMetricsResponse,
  type CopilotSeatsResponse,
} from "@/lib/copilot-api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

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

  const latestMetrics = metricsData?.[metricsData.length - 1];
  const adoptionStatus = seatsData && latestMetrics
    ? getAdoptionStatus(latestMetrics.total_active_users, seatsData.total_seats)
    : null;

  const chartData = metricsData?.slice(-14).map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    active: m.total_active_users,
    engaged: m.total_engaged_users,
  }));

  const featureData = latestMetrics
    ? [
        {
          name: "Code Completions",
          users: latestMetrics.copilot_ide_code_completions?.total_engaged_users || 0,
          color: "oklch(0.45 0.15 250)",
        },
        {
          name: "IDE Chat",
          users: latestMetrics.copilot_ide_chat?.total_engaged_users || 0,
          color: "oklch(0.65 0.18 145)",
        },
        {
          name: "PR Summaries",
          users: latestMetrics.copilot_dotcom_pull_requests?.total_engaged_users || 0,
          color: "oklch(0.7 0.15 45)",
        },
        {
          name: "GitHub Chat",
          users: latestMetrics.copilot_dotcom_chat?.total_engaged_users || 0,
          color: "oklch(0.55 0.2 300)",
        },
      ]
    : [];

  const getActivityStatus = (lastActivity: string | null) => {
    if (!lastActivity) return { label: "Never", variant: "outline" as const };
    const days = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 1) return { label: "Today", variant: "default" as const };
    if (days <= 7) return { label: `${days}d ago`, variant: "secondary" as const };
    return { label: `${days}d ago`, variant: "outline" as const };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Seats</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-20 mt-1" />
                    ) : (
                      <p className="text-3xl font-display font-bold text-foreground">
                        {seatsData?.total_seats || 0}
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" weight="duotone" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Active Users</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-20 mt-1" />
                    ) : (
                      <p className="text-3xl font-display font-bold text-foreground">
                        {latestMetrics?.total_active_users || 0}
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <ChartLineUp className="h-5 w-5 text-accent-foreground" weight="duotone" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Engaged Users</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-20 mt-1" />
                    ) : (
                      <p className="text-3xl font-display font-bold text-foreground">
                        {latestMetrics?.total_engaged_users || 0}
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-secondary rounded-lg">
                    <Code className="h-5 w-5 text-secondary-foreground" weight="duotone" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Adoption Rate</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-20 mt-1" />
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-display font-bold text-foreground">
                          {adoptionStatus?.ratio || 0}%
                        </p>
                        <Badge
                          variant={
                            adoptionStatus?.status === "Strong"
                              ? "default"
                              : adoptionStatus?.status === "Moderate"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {adoptionStatus?.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <ChartLineUp className="h-5 w-5 text-primary" weight="duotone" />
                  User Activity Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.45 0.15 250)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.45 0.15 250)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="engagedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(1 0 0)",
                          border: "1px solid oklch(0.9 0.01 250)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        stroke="oklch(0.45 0.15 250)"
                        strokeWidth={2}
                        fill="url(#activeGradient)"
                        name="Active Users"
                      />
                      <Area
                        type="monotone"
                        dataKey="engaged"
                        stroke="oklch(0.65 0.18 145)"
                        strokeWidth={2}
                        fill="url(#engagedGradient)"
                        name="Engaged Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-primary" weight="duotone" />
                  Feature Adoption
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={featureData} layout="vertical">
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(1 0 0)",
                          border: "1px solid oklch(0.9 0.01 250)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar dataKey="users" radius={[0, 4, 4, 0]} name="Users">
                        {featureData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" weight="duotone" />
                Assigned Seats
                {seatsData && (
                  <Badge variant="secondary" className="ml-2">
                    {seatsData.seats.length} users
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {seatsData?.seats.map((seat) => {
                    const activity = getActivityStatus(seat.last_activity_at);
                    return (
                      <div
                        key={seat.assignee.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={seat.assignee.avatar_url} alt={seat.assignee.login} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {seat.assignee.login.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {seat.assignee.login}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {seat.last_activity_editor && (
                              <span className="capitalize">{seat.last_activity_editor}</span>
                            )}
                            {seat.assigning_team && (
                              <span className="truncate">• {seat.assigning_team.name}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant={activity.variant} className="text-xs shrink-0">
                          {activity.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
