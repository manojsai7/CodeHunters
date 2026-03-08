import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectCard } from "@/components/projects/project-card";
import { getUser, createServerSupabaseClient } from "@/lib/supabase/server";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Projects | Code Hunters",
  description:
    "Browse 700+ ready-to-use developer project source code bundles. Download premium projects across web, mobile, AI, and more.",
  openGraph: {
    title: "Projects | Code Hunters",
    description:
      "Browse 700+ ready-to-use developer project source code bundles. Download premium projects across web, mobile, AI, and more.",
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

export default async function ProjectsPage({ searchParams: searchParamsPromise }: PageProps) {
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
    .from("projects")
    .select("id, slug, title, description, short_desc, price, mrp, thumbnail, category, difficulty, tech_tags, purchases_count, rating, review_count, is_bestseller")
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
    case "popular":
    case "downloads":
      query = query.order("purchases_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: projects } = await query;
  const safeProjects = projects ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Explore <span className="text-accent">Projects</span>
          </h1>
          <p className="mt-2 text-muted">
            Ready-to-use source code bundles — download, learn, and build
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <div className="mb-8">
            <ProjectFilters />
          </div>
        </Suspense>

        {/* Results count */}
        <p className="mb-6 text-sm text-muted">
          Showing {safeProjects.length}{" "}
          {safeProjects.length === 1 ? "project" : "projects"}
        </p>

        {/* Project Grid */}
        {safeProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {safeProjects.map((project: any, idx: number) => (
              <ProjectCard key={project.id} project={project} index={idx} />
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">
              No projects found
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
