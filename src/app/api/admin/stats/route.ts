import { NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Admin auth check
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = createAdminSupabaseClient();

    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all completed purchases with joins
    const { data: allPurchases } = await db
      .from("purchases")
      .select("id, amount, user_id, course_id, project_id, created_at, profiles(name, email), courses(title, slug), projects(title)")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    const purchases = allPurchases ?? [];

    // Total revenue
    const totalRevenue = purchases.reduce((sum: number, p: { amount: number }) => sum + (p.amount ?? 0), 0);

    // Total distinct students
    const studentSet = new Set(purchases.filter((p: { user_id: string | null }) => p.user_id).map((p: { user_id: string }) => p.user_id));
    const totalStudents = studentSet.size;

    // Total courses and projects
    const [{ count: totalCourses }, { count: totalProjects }] = await Promise.all([
      db.from("courses").select("*", { count: "exact", head: true }),
      db.from("projects").select("*", { count: "exact", head: true }),
    ]);

    // Recent purchases (last 10)
    const recentPurchases = purchases.slice(0, 10).map((p: Record<string, unknown>) => ({
      ...p,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile: p.profiles as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course: p.courses as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      project: p.projects as any,
    }));

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth: Record<string, number> = {};
    for (const p of purchases) {
      const d = new Date(p.created_at);
      if (d >= sixMonthsAgo) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        revenueByMonth[key] = (revenueByMonth[key] ?? 0) + (p.amount ?? 0);
      }
    }

    // Top courses by revenue
    const courseRevMap: Record<string, { revenue: number; count: number; title: string; slug: string | null }> = {};
    for (const p of purchases) {
      if (p.course_id) {
        if (!courseRevMap[p.course_id]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const c = p.courses as any;
          courseRevMap[p.course_id] = { revenue: 0, count: 0, title: c?.title ?? "Unknown", slug: c?.slug ?? null };
        }
        courseRevMap[p.course_id].revenue += p.amount ?? 0;
        courseRevMap[p.course_id].count++;
      }
    }
    const topCourses = Object.entries(courseRevMap)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([courseId, info]) => ({
        courseId,
        title: info.title,
        slug: info.slug,
        revenue: info.revenue,
        purchases: info.count,
      }));

    // Conversion rate
    const { count: totalLeads } = await db
      .from("pre_checkout_leads")
      .select("*", { count: "exact", head: true });

    const totalCompletedPurchases = purchases.length;

    const conversionRate =
      (totalLeads ?? 0) > 0
        ? Math.round((totalCompletedPurchases / (totalLeads ?? 1)) * 10000) / 100
        : 0;

    return NextResponse.json({
      totalRevenue,
      totalStudents,
      totalCourses: totalCourses ?? 0,
      totalProjects: totalProjects ?? 0,
      recentPurchases,
      revenueByMonth,
      topCourses,
      conversionRate,
      totalLeads: totalLeads ?? 0,
      totalCompletedPurchases,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
