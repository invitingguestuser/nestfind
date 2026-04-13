import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Building2,
  Clock,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminStats } from "../hooks/useAdminStats";

const CHART_DATA = [
  { month: "Nov", listings: 38, users: 24 },
  { month: "Dec", listings: 52, users: 31 },
  { month: "Jan", listings: 44, users: 27 },
  { month: "Feb", listings: 61, users: 40 },
  { month: "Mar", listings: 57, users: 35 },
  { month: "Apr", listings: 73, users: 48 },
];

interface StatCardProps {
  label: string;
  value: bigint | undefined;
  icon: React.ElementType;
  accent?: boolean;
}

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card data-ocid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            {value === undefined ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <p
                className={`mt-1 text-3xl font-display font-bold ${accent ? "text-primary" : "text-foreground"}`}
              >
                {value.toLocaleString()}
              </p>
            )}
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    {
      label: "Total Listings",
      value: isLoading ? undefined : stats?.totalListings,
      icon: Building2,
    },
    {
      label: "Pending Approvals",
      value: isLoading ? undefined : stats?.pendingApprovals,
      icon: Clock,
      accent: true,
    },
    {
      label: "Active Users",
      value: isLoading ? undefined : stats?.activeUsers,
      icon: Users,
    },
    {
      label: "Total Inquiries",
      value: isLoading ? undefined : stats?.totalInquiries,
      icon: MessageSquare,
    },
    {
      label: "Blog Posts",
      value: isLoading ? undefined : stats?.totalBlogPosts,
      icon: FileText,
    },
    {
      label: "Flagged Content",
      value: isLoading ? undefined : 0n,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Stats grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        data-ocid="admin-stats-grid"
      >
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Activity Overview — Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={CHART_DATA}
              margin={{ top: 4, right: 16, left: -8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                }}
              />
              <Bar
                dataKey="listings"
                name="Listings"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="users"
                name="New Users"
                fill="hsl(var(--accent))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
