import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseCard } from "@/components/courses/course-card";

import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const revalidate = 60;

type CourseItem = Awaited<ReturnType<typeof prisma.course.findMany>>[number];

export const metadata: Metadata = {
  title: "Courses | Code Hunters",
  description:
    "Browse premium programming courses. Learn web development, mobile development, data science, and more from industry experts.",
  openGraph: {
    title: "Courses | Code Hunters",
    description:
      "Browse premium programming courses. Learn web development, mobile development, data science, and more.",
  },
};

interface PageProps {
  searchParams: {
    category?: string;
    difficulty?: string;
    search?: string;
    sort?: string;
  };
}

export default async function CoursesPage({ searchParams }: PageProps) {
  // Auth
  let userData = null;
  try {
    const user = await getUser();
    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });
      if (profile) {
        userData = {
          id: user.id,
          email: user.email || "",
          name: profile.name,
          role: profile.role,
          goldCoins: profile.goldCoins,
        };
      }
    }
  } catch {
    // Not authenticated
  }

  // Build where clause
  const where: Record<string, unknown> = { isPublished: true };
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.difficulty) where.difficulty = searchParams.difficulty;
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (searchParams.sort) {
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "popular":
      orderBy = { purchasesCount: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  let courses: CourseItem[] = [];
  try {
    courses = await prisma.course.findMany({
      where,
      orderBy,
    });
  } catch {
    // Database unavailable — render with empty list
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Explore <span className="text-accent">Courses</span>
          </h1>
          <p className="mt-2 text-muted">
            Learn from industry experts and build real-world applications
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <div className="mb-8">
            <CourseFilters />
          </div>
        </Suspense>

        {/* Results count */}
        <p className="mb-6 text-sm text-muted">
          {courses.length} {courses.length === 1 ? "course" : "courses"} found
        </p>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: CourseItem, idx: number) => (
              <CourseCard key={course.id} course={course} index={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-surface p-6">
              <svg
                className="h-12 w-12 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">
              No courses found
            </h3>
            <p className="mt-1 text-sm text-muted">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
