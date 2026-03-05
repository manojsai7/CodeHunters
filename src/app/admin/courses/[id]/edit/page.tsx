import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CourseForm } from "@/components/admin/course-form";

export const metadata = {
  title: "Edit Course — Admin",
};

export default async function EditCoursePage({
  params,
}: {
  params: { id: string };
}) {
  try {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  if (!course) notFound();

  const courseData = {
    ...course,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    lessons: course.lessons.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
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
