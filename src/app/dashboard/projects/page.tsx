import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FolderDown, Download, ExternalLink } from "lucide-react";
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

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: user.id,
      projectId: { not: null },
      status: "completed",
    },
    include: {
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  type PurchaseRow = typeof purchases[number];
  const projects = purchases
    .filter((p: PurchaseRow) => p.project)
    .map((p: PurchaseRow) => ({
      ...p.project!,
      purchasedAt: p.createdAt,
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
          {projects.map((project: typeof projects[number]) => (
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
                {project.techTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.techTags.slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.techTags.length > 4 && (
                      <span className="text-[10px] text-muted">
                        +{project.techTags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 text-xs text-muted">
                  Purchased {formatDate(project.purchasedAt)}
                </div>

                <a
                  href={project.zipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Project
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </Button>
                </a>
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
    redirect("/login?error=true");
  }
}
