import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectCard } from "@/components/projects/project-card";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

type ProjectItem = Awaited<ReturnType<typeof prisma.project.findMany>>[number];

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
  searchParams: {
    category?: string;
    difficulty?: string;
    search?: string;
    sort?: string;
  };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
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
    case "popular":
      orderBy = { purchasesCount: "desc" };
      break;
    case "downloads":
      orderBy = { purchasesCount: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  let projects: ProjectItem[] = [];
  try {
    projects = await prisma.project.findMany({
      where,
      orderBy,
    });
  } catch {
    // Database unavailable — render with empty list
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Explore <span className="text-primary">Projects</span>
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
          Showing {projects.length}{" "}
          {projects.length === 1 ? "project" : "projects"}
        </p>

        {/* Project Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: ProjectItem, idx: number) => (
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
