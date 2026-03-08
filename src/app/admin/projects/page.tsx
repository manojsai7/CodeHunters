import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectsTable } from "./projects-table";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Manage Projects — Admin",
};

export default async function AdminProjectsPage() {
  try {
  const db = createAdminSupabaseClient();

  const { data: projects } = await db
    .from("projects")
    .select("*, purchases(id)")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (projects ?? []).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    thumbnail: p.thumbnail,
    category: p.category,
    difficulty: p.difficulty,
    price: p.price,
    mrp: p.mrp,
    isPublished: p.is_published,
    isBestseller: p.is_bestseller,
    purchasesCount: Array.isArray(p.purchases) ? p.purchases.length : 0,
    createdAt: p.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-muted mt-1">
            {data.length} total projects
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      <ProjectsTable data={data} />
    </div>
  );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-white">Unable to load projects</h2>
        <p className="mt-2 text-sm text-muted">Database connection unavailable. Please try again later.</p>
      </div>
    );
  }
}
