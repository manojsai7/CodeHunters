import { DollarSign, GraduationCap, BookOpen, FolderOpen } from "lucide-react";
import prisma from "@/lib/prisma";
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
  // Fetch stats inline for server component
  const revenueAgg = await prisma.purchase.aggregate({
    where: { status: "completed" },
    _sum: { amount: true },
  });
  const totalRevenue = revenueAgg._sum.amount ?? 0;

  const totalStudentsGroup = await prisma.purchase.groupBy({
    by: ["userId"],
    where: { status: "completed", userId: { not: null } },
  });
  const totalStudents = totalStudentsGroup.length;

  const [totalCourses, totalProjects] = await Promise.all([
    prisma.course.count(),
    prisma.project.count(),
  ]);

  // Recent purchases
  const recentPurchases = await prisma.purchase.findMany({
    where: { status: "completed" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      profile: { select: { name: true, email: true } },
      course: { select: { title: true } },
      project: { select: { title: true } },
    },
  });

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyPurchases = await prisma.purchase.findMany({
    where: { status: "completed", createdAt: { gte: sixMonthsAgo } },
    select: { amount: true, createdAt: true },
  });

  const revenueByMonth: Record<string, number> = {};
  for (const p of monthlyPurchases) {
    const key = `${p.createdAt.getFullYear()}-${String(
      p.createdAt.getMonth() + 1
    ).padStart(2, "0")}`;
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

  // Top courses
  const topCoursesAgg = await prisma.purchase.groupBy({
    by: ["courseId"],
    where: { status: "completed", courseId: { not: null } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });

  const topCourses = await Promise.all(
    topCoursesAgg.map(
      async (tc: {
        courseId: string | null;
        _sum: { amount: number | null };
        _count: { id: number };
      }) => {
        const course = tc.courseId
          ? await prisma.course.findUnique({
              where: { id: tc.courseId },
              select: { title: true },
            })
          : null;
        return {
          title: course?.title ?? "Unknown",
          revenue: tc._sum.amount ?? 0,
          purchases: tc._count.id,
        };
      }
    )
  );

  // Conversion
  const [totalLeads, totalCompleted] = await Promise.all([
    prisma.preCheckoutLead.count(),
    prisma.purchase.count({ where: { status: "completed" } }),
  ]);
  const conversionRate =
    totalLeads > 0 ? Math.round((totalCompleted / totalLeads) * 10000) / 100 : 0;

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
          value={totalCourses.toString()}
          icon={BookOpen}
          iconColor="text-primary"
        />
        <StatsCard
          label="Projects"
          value={totalProjects.toString()}
          icon={FolderOpen}
          iconColor="text-gold"
        />
      </div>

      {/* Charts — client component */}
      <AdminDashboardCharts
        monthlyData={monthlyData}
        topCourses={topCourses}
        conversionRate={conversionRate}
        totalLeads={totalLeads}
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
                    {formatDate(p.createdAt)}
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
