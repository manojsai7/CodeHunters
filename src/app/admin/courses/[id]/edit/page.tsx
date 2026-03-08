import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { CourseForm } from "@/components/admin/course-form";

export const metadata = {
  title: "Edit Course — Admin",
};

export default async function EditCoursePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  try {
  const db = createAdminSupabaseClient();

  const { data: course } = await db
    .from("courses")
    .select("*, lessons(*)") 
    .eq("id", params.id)
    .single();

  if (!course) notFound();

  // Sort lessons by order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessons = Array.isArray(course.lessons) ? (course.lessons as any[]).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) : [];

  const courseData = {
    ...course,
    lessons,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Course</h1>
        <p className="text-sm text-muted mt-1">{course.title}</p>
      </div>
      <CourseForm course={courseData} />
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    notFound();
  }
}
