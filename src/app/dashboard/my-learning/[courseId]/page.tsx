import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { CoursePlayerClient } from "@/components/dashboard/course-player-client";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const params = await paramsPromise;
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { title: true },
    });
    return {
      title: course ? `${course.title} — Player` : "Course Player",
    };
  } catch {
    return { title: "Course Player" };
  }
}

export default async function CoursePlayerPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const params = await paramsPromise;
  try {
  const user = await getUser();
  if (!user) redirect("/login");

  // Verify purchase
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      courseId: params.courseId,
      status: "completed",
    },
  });

  if (!purchase) {
    redirect("/dashboard/my-learning");
  }

  // Fetch course with published lessons
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) notFound();

  // Fetch user progress for all lessons
  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: course.lessons.map((l: { id: string }) => l.id) },
    },
  });

  const progressMap: Record<string, boolean> = {};
  type ProgressRow = { lessonId: string; completed: boolean };
  type LessonRow = { id: string; title: string; videoUrl: string; duration: number; order: number };
  progress.forEach((p: ProgressRow) => {
    progressMap[p.lessonId] = p.completed;
  });

  const lessons = course.lessons.map((l: LessonRow) => ({
    id: l.id,
    title: l.title,
    videoUrl: l.videoUrl,
    duration: l.duration,
    order: l.order,
    isCompleted: progressMap[l.id] || false,
  }));

  return (
    <div className="-mx-4 -mt-8 sm:-mx-6 lg:-mx-8">
      <CoursePlayerClient
        courseId={course.id}
        courseTitle={course.title}
        lessons={lessons}
        totalLessons={lessons.length}
      />
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    redirect("/login");
  }
}
