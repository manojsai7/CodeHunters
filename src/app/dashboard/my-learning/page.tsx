import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { BookOpen, PlayCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "My Learning",
};

export default async function MyLearningPage() {
  try {
  const user = await getUser();
  if (!user) redirect("/login");

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: user.id,
      courseId: { not: null },
      status: "completed",
    },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
  });

  type LPRow = { lessonId: string; completed: boolean; createdAt: Date };
  const completedLessonIds = new Set(
    lessonProgress.filter((lp: LPRow) => lp.completed).map((lp: LPRow) => lp.lessonId)
  );

  // Build course cards with progress
  type PurchaseRow = typeof purchases[number];
  type LessonRow = { id: string; title: string; videoUrl: string; duration: number; order: number; isFree: boolean };
  const courses = purchases
    .filter((p: PurchaseRow) => p.course)
    .map((p: PurchaseRow) => {
      const course = p.course!;
      const lessons: LessonRow[] = course.lessons || [];
      const totalLessons = lessons.length;
      const completedLessons = lessons.filter((l: LessonRow) =>
        completedLessonIds.has(l.id)
      ).length;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
      const totalDuration = lessons.reduce((sum: number, l: LessonRow) => sum + l.duration, 0);

      // Find last-accessed lesson
      const lastProgress = lessonProgress
        .filter((lp: LPRow) => lessons.some((l: LessonRow) => l.id === lp.lessonId))
        .sort(
          (a: LPRow, b: LPRow) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        category: course.category,
        difficulty: course.difficulty,
        totalLessons,
        completedLessons,
        progress,
        totalDuration,
        purchasedAt: p.createdAt,
        lastAccessed: lastProgress?.createdAt || p.createdAt,
      };
    });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          My Learning
        </h1>
        <p className="mt-1 text-muted">
          {courses.length > 0
            ? `You have ${courses.length} course${courses.length > 1 ? "s" : ""} in progress.`
            : "Start your learning journey today."}
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: typeof courses[number]) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Badge variant="default">{course.category}</Badge>
                  <Badge variant="outline">{course.difficulty}</Badge>
                </div>
                {course.progress === 100 && (
                  <div className="absolute right-3 top-3">
                    <Badge variant="success">Completed</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 pt-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-white">
                  {course.title}
                </h3>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(course.totalDuration)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                    <span>
                      {course.completedLessons} / {course.totalLessons} lessons
                    </span>
                    <span className="font-medium text-primary">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted">
                  Last accessed {formatDate(course.lastAccessed)}
                </div>

                <Link href={`/dashboard/my-learning/${course.id}`}>
                  <Button size="sm" className="mt-3 w-full gap-2">
                    <PlayCircle className="h-4 w-4" />
                    {course.progress === 0
                      ? "Start Learning"
                      : course.progress === 100
                        ? "Review Course"
                        : "Continue"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              No courses yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Explore our catalog and start building real-world skills with
              expert-led courses.
            </p>
            <Link href="/courses">
              <Button className="mt-5">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    redirect("/login");
  }
}
