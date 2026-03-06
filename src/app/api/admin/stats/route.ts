import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Admin auth check
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Total revenue (completed purchases, amount is in paise)
    const revenueAgg = await prisma.purchase.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
    });
    const totalRevenue = revenueAgg._sum.amount ?? 0;

    // Total distinct students
    const totalStudents = await prisma.purchase.groupBy({
      by: ["userId"],
      where: { status: "completed", userId: { not: null } },
    });

    // Total courses and projects
    const [totalCourses, totalProjects] = await Promise.all([
      prisma.course.count(),
      prisma.project.count(),
    ]);

    // Recent purchases (last 10)
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
      where: {
        status: "completed",
        createdAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, createdAt: true },
    });

    const revenueByMonth: Record<string, number> = {};
    for (const p of monthlyPurchases) {
      const key = `${p.createdAt.getFullYear()}-${String(
        p.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      revenueByMonth[key] = (revenueByMonth[key] ?? 0) + p.amount;
    }

    // Top courses by revenue
    const topCourses = await prisma.purchase.groupBy({
      by: ["courseId"],
      where: { status: "completed", courseId: { not: null } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const topCourseDetails = await Promise.all(
      topCourses.map(async (tc: { courseId: string | null; _sum: { amount: number | null }; _count: { id: number } }) => {
        const course = tc.courseId
          ? await prisma.course.findUnique({
              where: { id: tc.courseId },
              select: { title: true, slug: true },
            })
          : null;
        return {
          courseId: tc.courseId,
          title: course?.title ?? "Unknown",
          slug: course?.slug,
          revenue: tc._sum.amount ?? 0,
          purchases: tc._count.id,
        };
      })
    );

    // Conversion rate
    const [totalLeads, totalCompletedPurchases] = await Promise.all([
      prisma.preCheckoutLead.count(),
      prisma.purchase.count({ where: { status: "completed" } }),
    ]);

    const conversionRate =
      totalLeads > 0
        ? Math.round((totalCompletedPurchases / totalLeads) * 10000) / 100
        : 0;

    return NextResponse.json({
      totalRevenue,
      totalStudents: totalStudents.length,
      totalCourses,
      totalProjects,
      recentPurchases,
      revenueByMonth,
      topCourses: topCourseDetails,
      conversionRate,
      totalLeads,
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
