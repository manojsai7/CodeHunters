import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  BookOpen,
  FolderDown,
  Coins,
  TrendingUp,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Dashboard Overview",
};

export default async function DashboardPage() {
  try {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/login?error=true");

  // Fetch counts and data in parallel
  const [coursePurchases, projectPurchases, lessonProgress, recentPurchases] =
    await Promise.all([
      prisma.purchase.findMany({
        where: { userId: user.id, courseId: { not: null }, status: "completed" },
        include: {
          course: {
            include: { lessons: { where: { isFree: false } } },
          },
        },
      }),
      prisma.purchase.count({
        where: {
          userId: user.id,
          projectId: { not: null },
          status: "completed",
        },
      }),
      prisma.lessonProgress.findMany({
        where: { userId: user.id, completed: true },
      }),
      prisma.purchase.findMany({
        where: { userId: user.id, status: "completed" },
        include: { course: true, project: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const coursesEnrolled = coursePurchases.length;

  // Calculate completion rate
  const totalLessons = coursePurchases.reduce(
    (sum: number, p: typeof coursePurchases[number]) => sum + (p.course?.lessons?.length || 0),
    0
  );
  const completedLessons = lessonProgress.length;
  const completionRate =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Courses in progress (with progress info)
  const completedLessonIds = new Set(lessonProgress.map((lp: { lessonId: string }) => lp.lessonId));
  type CourseInProgress = { course: NonNullable<typeof coursePurchases[number]["course"]>; completed: number; total: number; progress: number };
  const coursesInProgress: CourseInProgress[] = coursePurchases
    .map((p: typeof coursePurchases[number]) => {
      const course = p.course;
      if (!course) return null;
      const total = course.lessons?.length || 0;
      const completed = course.lessons?.filter((l: { id: string }) =>
        completedLessonIds.has(l.id)
      ).length || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { course, completed, total, progress };
    })
    .filter((c: CourseInProgress | null): c is CourseInProgress => c !== null && c.progress < 100)
    .slice(0, 3);

  const statCards = [
    {
      label: "Courses Enrolled",
      value: coursesEnrolled,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Projects Purchased",
      value: projectPurchases,
      icon: FolderDown,
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
    {
      label: "Gold Coins",
      value: profile.goldCoins,
      icon: Coins,
      color: "text-gold",
      bg: "bg-gold/10",
      border: "border-gold/20",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome back, {profile.name.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-muted">
          Here&apos;s an overview of your learning journey.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`border ${stat.border}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted">
                      {stat.label}
                    </p>
                    <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-lg ${stat.bg} p-2.5`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Continue Learning */}
      {coursesInProgress.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Continue Learning</h2>
            <Link
              href="/dashboard/my-learning"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coursesInProgress.map(({ course, completed, total, progress }) => (
              <Card
                key={course.id}
                className="group overflow-hidden hover:border-primary/30 transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="default">{course.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-4 pt-4">
                  <h3 className="line-clamp-1 text-sm font-semibold text-white">
                    {course.title}
                  </h3>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                      <span>
                        {completed} of {total} lessons
                      </span>
                      <span className="font-medium text-primary">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <Link href={`/dashboard/my-learning/${course.id}`}>
                    <Button size="sm" className="mt-3 w-full gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Continue
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-white">Recent Activity</h2>
        {recentPurchases.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentPurchases.map((purchase: typeof recentPurchases[number]) => (
                  <div
                    key={purchase.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {purchase.courseId ? (
                        <BookOpen className="h-5 w-5 text-primary" />
                      ) : (
                        <FolderDown className="h-5 w-5 text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {purchase.course?.title ||
                          purchase.project?.title ||
                          "Purchase"}
                      </p>
                      <p className="text-xs text-muted">
                        {purchase.courseId ? "Course" : "Project"} •{" "}
                        {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {formatPrice(purchase.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-muted" />
              <p className="text-sm text-muted">No activity yet.</p>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="mt-4">
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    redirect("/login?error=true");
  }
}
