import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CourseFilters } from "@/components/courses/course-filters";
import { CourseCard } from "@/components/courses/course-card";

import { getUser, createServerSupabaseClient } from "@/lib/supabase/server";

export const revalidate = 30;

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
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function CoursesPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise;
  const supabase = await createServerSupabaseClient();

  // Auth
  let userData = null;
  try {
    const user = await getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role, gold_coins")
        .eq("user_id", user.id)
        .single();
      if (profile) {
        userData = {
          id: user.id,
          email: user.email || "",
          name: profile.name,
          role: profile.role,
          goldCoins: profile.gold_coins,
        };
      }
    }
  } catch {
    // Not authenticated
  }

  // Build Supabase query
  let query = supabase
    .from("courses")
    .select("id, slug, title, description, short_desc, price, mrp, thumbnail, category, difficulty, tech_tags, purchases_count, rating, review_count, is_bestseller, instructor_name, preview_video_url")
    .eq("is_published", true)
    .limit(50);

  if (searchParams.category) query = query.eq("category", searchParams.category);
  if (searchParams.difficulty) query = query.eq("difficulty", searchParams.difficulty);
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`);
  }

  // Sort
  switch (searchParams.sort) {
    case "price-low":
      query = query.order("price", { ascending: true });
      break;
    case "price-high":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "popular":
      query = query.order("purchases_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: courses } = await query;
  const safeCourses = courses ?? [];

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
          {safeCourses.length} {safeCourses.length === 1 ? "course" : "courses"} found
        </p>

        {/* Course Grid */}
        {safeCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {safeCourses.map((course: any, idx: number) => (
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
