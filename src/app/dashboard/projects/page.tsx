import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUser, createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { FolderDown } from "lucide-react";
import { SecureDownloadButton } from "@/components/dashboard/secure-download-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "My Projects",
};

export default async function MyProjectsPage() {
  try {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createServerSupabaseClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, projects(*)")
    .eq("user_id", user.id)
    .not("project_id", "is", null)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const projects = (purchases ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.projects)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      ...p.projects,
      purchasedAt: p.created_at,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          My Projects
        </h1>
        <p className="mt-1 text-muted">
          {projects.length > 0
            ? `You own ${projects.length} project${projects.length > 1 ? "s" : ""}.`
            : "Purchase projects to download source code instantly."}
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {projects.map((project: any) => (
            <Card
              key={project.id}
              className="group overflow-hidden hover:border-secondary/30 transition-all duration-300"
            >
              {project.thumbnail && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <Badge variant="secondary">{project.category}</Badge>
                    <Badge variant="outline">{project.difficulty}</Badge>
                  </div>
                </div>
              )}
              <CardContent className="p-4 pt-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-white">
                  {project.title}
                </h3>

                {/* Tech tags */}
                {(project.tech_tags ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(project.tech_tags ?? []).slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                    {(project.tech_tags ?? []).length > 4 && (
                      <span className="text-[10px] text-muted">
                        +{(project.tech_tags ?? []).length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 text-xs text-muted">
                  Purchased {formatDate(project.purchasedAt)}
                </div>

                <SecureDownloadButton projectId={project.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="rounded-full bg-secondary/10 p-4 mb-4">
              <FolderDown className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              No projects yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Browse production-ready projects with full source code. Download
              instantly after purchase.
            </p>
            <Link href="/projects">
              <Button variant="secondary" className="mt-5">
                Browse Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    console.error("[projects] Failed to load data:", e);
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted">Something went wrong loading projects. Please try again later.</p>
      </div>
    );
  }
}
