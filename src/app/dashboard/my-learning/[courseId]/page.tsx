import { redirect, notFound } from "next/navigation";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { CoursePlayerClient } from "@/components/dashboard/course-player-client";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const params = await paramsPromise;
  try {
    const db = createAdminSupabaseClient();
    const { data: course } = await db
      .from("courses")
      .select("title")
      .eq("id", params.courseId)
      .maybeSingle();
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

  const db = createAdminSupabaseClient();

  // Verify purchase
  const { data: purchase } = await db
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", params.courseId)
    .eq("status", "completed")
    .maybeSingle();

  if (!purchase) {
    redirect("/dashboard/my-learning");
  }

  // Fetch course with published lessons
  const { data: course } = await db
    .from("courses")
    .select("id, title, lessons(id, title, video_url, duration, \"order\")")
    .eq("id", params.courseId)
    .single();

  if (!course) notFound();

  // Sort lessons by order
  const sortedLessons = (course.lessons ?? []).sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order
  );

  // Fetch user progress for all lessons
  const lessonIds = sortedLessons.map((l: { id: string }) => l.id);
  const { data: progress } = await db
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  const progressMap: Record<string, boolean> = {};
  (progress ?? []).forEach((p: { lesson_id: string; completed: boolean }) => {
    progressMap[p.lesson_id] = p.completed;
  });

  const lessons = sortedLessons.map((l: { id: string; title: string; video_url: string; duration: number; order: number }) => ({
    id: l.id,
    title: l.title,
    videoUrl: l.video_url,
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
    console.error("[course-player] Failed to load:", e);
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted">Something went wrong loading this course. Please try again later.</p>
      </div>
    );
  }
}
