import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CoursesTable } from "./courses-table";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Manage Courses — Admin",
};

export default async function AdminCoursesPage() {
  try {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { purchases: true, lessons: true, reviews: true } },
    },
  });

  const data = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    thumbnail: c.thumbnail,
    category: c.category,
    difficulty: c.difficulty,
    price: c.price,
    mrp: c.mrp,
    isPublished: c.isPublished,
    isBestseller: c.isBestseller,
    purchasesCount: c._count.purchases,
    lessonsCount: c._count.lessons,
    reviewCount: c._count.reviews,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-sm text-muted mt-1">
            {courses.length} total courses
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </Link>
      </div>

      <CoursesTable data={data} />
    </div>
  );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-white">Unable to load courses</h2>
        <p className="mt-2 text-sm text-muted">Database connection unavailable. Please try again later.</p>
      </div>
    );
  }
}
