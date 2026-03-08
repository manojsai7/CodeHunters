import { DollarSign, GraduationCap, BookOpen, FolderOpen } from "lucide-react";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { AdminDashboardCharts } from "./dashboard-charts";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Admin Dashboard — Code Hunters",
};

export default async function AdminDashboardPage() {
  try {
  const db = createAdminSupabaseClient();

  // Fetch all completed purchases for aggregation
  const { data: completedPurchases } = await db
    .from("purchases")
    .select("id, user_id, course_id, amount, created_at, profiles(name, email), courses(title), projects(title)")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const allCompleted = completedPurchases ?? [];
  const totalRevenue = allCompleted.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalStudents = new Set(allCompleted.filter(p => p.user_id).map(p => p.user_id)).size;

  const [{ count: totalCourses }, { count: totalProjects }] = await Promise.all([
    db.from("courses").select("*", { count: "exact", head: true }),
    db.from("projects").select("*", { count: "exact", head: true }),
  ]);

  // Recent purchases (first 10 from already sorted list)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentPurchases = allCompleted.slice(0, 10).map((p: any) => ({
    ...p,
    profile: p.profiles,
    course: p.courses,
    project: p.projects,
  }));

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth: Record<string, number> = {};
  for (const p of allCompleted) {
    const d = new Date(p.created_at);
    if (d < sixMonthsAgo) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueByMonth[key] = (revenueByMonth[key] ?? 0) + p.amount;
  }

  const monthlyData = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      }),
      revenue,
    }));

  // Top courses by revenue
  const courseRevMap: Record<string, { revenue: number; count: number }> = {};
  for (const p of allCompleted) {
    if (!p.course_id) continue;
    if (!courseRevMap[p.course_id]) courseRevMap[p.course_id] = { revenue: 0, count: 0 };
    courseRevMap[p.course_id].revenue += p.amount ?? 0;
    courseRevMap[p.course_id].count += 1;
  }
  const topCourseIds = Object.entries(courseRevMap)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  const topCourses = await Promise.all(
    topCourseIds.map(async ([courseId, stats]) => {
      const { data: course } = await db
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();
      return {
        title: course?.title ?? "Unknown",
        revenue: stats.revenue,
        purchases: stats.count,
      };
    })
  );

  // Conversion
  const { count: totalLeads } = await db
    .from("pre_checkout_leads")
    .select("*", { count: "exact", head: true });
  const totalCompleted = allCompleted.length;
  const conversionRate =
    (totalLeads ?? 0) > 0 ? Math.round((totalCompleted / (totalLeads ?? 1)) * 10000) / 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Overview of your platform performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          iconColor="text-success"
          change={12}
        />
        <StatsCard
          label="Total Students"
          value={totalStudents.toLocaleString()}
          icon={GraduationCap}
          iconColor="text-secondary"
          change={8}
        />
        <StatsCard
          label="Courses"
          value={(totalCourses ?? 0).toString()}
          icon={BookOpen}
          iconColor="text-primary"
        />
        <StatsCard
          label="Projects"
          value={(totalProjects ?? 0).toString()}
          icon={FolderOpen}
          iconColor="text-gold"
        />
      </div>

      {/* Charts — client component */}
      <AdminDashboardCharts
        monthlyData={monthlyData}
        topCourses={topCourses}
        conversionRate={conversionRate}
        totalLeads={totalLeads ?? 0}
        totalCompleted={totalCompleted}
      />

      {/* Recent purchases */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Recent Purchases</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-white">
                    {p.profile?.name ?? "Guest"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {p.course?.title ?? p.project?.title ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {formatPrice(p.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">Completed</Badge>
                  </td>
                </tr>
              ))}
              {recentPurchases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted">
                    No purchases yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Dashboard Unavailable</h1>
        <p className="mt-2 text-sm text-muted">Unable to connect to the database. Please try again later.</p>
      </div>
    );
  }
}
