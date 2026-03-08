import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Download,
  Share2,
  ShoppingCart,
  CheckCircle2,
  Code2,
  FileCode2,
  Layers,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { ProjectStats } from "@/components/projects/project-stats";
import { ProjectCard } from "@/components/projects/project-card";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params: paramsPromise,
}: PageProps): Promise<Metadata> {
  const params = await paramsPromise;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: project } = await supabase
      .from("projects")
      .select("title, short_desc, description, thumbnail, is_published")
      .eq("slug", params.slug)
      .single();

    if (!project || !project.is_published) {
      return { title: "Project Not Found | Code Hunters" };
    }

    return {
      title: `${project.title} | Code Hunters`,
      description: project.short_desc || project.description,
      openGraph: {
        title: `${project.title} | Code Hunters`,
        description: project.short_desc || project.description,
        images: project.thumbnail ? [{ url: project.thumbnail }] : [],
      },
    };
  } catch {
    return { title: "Project Not Found | Code Hunters" };
  }
}

export default async function ProjectDetailPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const supabase = await createServerSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let project: any;
  try {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", params.slug)
      .single();
    project = data;
  } catch {
    notFound();
  }

  if (!project || !project.is_published) {
    notFound();
  }

  // Auth + purchase check
  let userData = null;
  let hasPurchased = false;

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

      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", project.id)
        .eq("status", "completed")
        .limit(1)
        .maybeSingle();
      hasPurchased = !!purchase;
    }
  } catch {
    // Not authenticated
  }

  // Related projects (same category, exclude current)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedProjects: any[] = [];
  try {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .eq("category", project.category)
      .neq("id", project.id)
      .order("purchases_count", { ascending: false })
      .limit(3);
    relatedProjects = data ?? [];
  } catch {
    // Database unavailable — skip related projects
  }

  const hasSale = project.price < project.mrp;
  const discountPercent = hasSale
    ? Math.round(((project.mrp - project.price) / project.mrp) * 100)
    : 0;

  // Map snake_case to convenient local names
  const previewImages: string[] = project.preview_images ?? [];
  const techTags: string[] = project.tech_tags ?? [];
  const shortDesc: string | null = project.short_desc;
  const purchasesCount: number = project.purchases_count ?? 0;
  const reviewCount: number = project.review_count ?? 0;
  const isBestseller: boolean = project.is_bestseller ?? false;
  const zipUrl: string = project.zip_url ?? '';
  const updatedAt: string = project.updated_at;

  const whatsIncluded = [
    "Complete source code",
    "README with setup instructions",
    "Environment configuration files",
    "Database schema & migrations",
    "Responsive design implementation",
    "Clean, commented code structure",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
          <Link
            href="/projects"
            className="hover:text-white transition-colors"
          >
            Projects
          </Link>
          <span>/</span>
          <span className="text-white truncate">{project.title}</span>
        </nav>

        {/* Hero / Gallery */}
        <div className="mb-10">
          <ProjectGallery
            images={
              previewImages.length > 0
                ? previewImages
                : project.thumbnail
                  ? [project.thumbnail]
                  : []
            }
            title={project.title}
          />
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* ────── LEFT COLUMN ────── */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Title + Badges */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="default">{project.category}</Badge>
                <Badge variant="secondary">{project.difficulty}</Badge>
                {isBestseller && (
                  <Badge variant="bestseller">Bestseller</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl leading-tight">
                {project.title}
              </h1>

              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold text-gold">
                    {project.rating.toFixed(1)}
                  </span>
                  <span>
                    ({project.reviewCount}{" "}
                    {project.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>
                    {project.purchasesCount.toLocaleString()} downloads
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span>{project.techTags.length} technologies</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                About this Project
              </h2>
              <div className="prose prose-invert max-w-none text-muted leading-relaxed">
                <p>{project.description}</p>
                {shortDesc && (
                  <p className="mt-3">{shortDesc}</p>
                )}
              </div>
            </div>

            {/* Tech Stack Details */}
            {techTags.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-secondary" />
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {techTags.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface/50 px-3 py-2 text-sm text-white"
                    >
                      <FileCode2 className="h-4 w-4 text-primary" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                What&apos;s Included
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {whatsIncluded.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-white/5 bg-surface/30 p-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    <span className="text-sm text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Images Gallery (if additional images beyond hero) */}
            {previewImages.length > 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">
                  Preview Screenshots
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {previewImages.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative aspect-video overflow-hidden rounded-lg border border-white/10"
                    >
                      <Image
                        src={img}
                        alt={`${project.title} screenshot ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ────── RIGHT SIDEBAR ────── */}
          <aside className="w-full shrink-0 lg:w-[380px]">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Price Card */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {project.thumbnail ? (
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/20">
                      <Code2 className="h-16 w-16 text-white/40" />
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-5">
                  {/* Price */}
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(project.price)}
                    </span>
                    {hasSale && (
                      <>
                        <span className="text-lg text-muted line-through">
                          {formatPrice(project.mrp)}
                        </span>
                        <Badge variant="error" className="text-xs font-bold">
                          {discountPercent}% OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Buy / Download CTA */}
                  {hasPurchased ? (
                    <Link
                      href={zipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button size="lg" className="w-full">
                        <Download className="mr-2 h-5 w-5" />
                        Download Project
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/checkout/project/${project.slug}`}
                      className="block"
                    >
                      <Button size="lg" className="w-full">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Buy Now
                      </Button>
                    </Link>
                  )}

                  {/* Stats */}
                  <div className="border-t border-white/5 pt-5">
                    <ProjectStats
                      purchasesCount={purchasesCount}
                      rating={project.rating}
                      reviewCount={reviewCount}
                      difficulty={project.difficulty}
                      category={project.category}
                      updatedAt={updatedAt}
                    />
                  </div>

                  {/* Tech Stack Pills */}
                  {techTags.length > 0 && (
                    <div className="border-t border-white/5 pt-5">
                      <h4 className="mb-3 text-sm font-semibold text-white">
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {techTags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[11px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted hover:text-white"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share this project
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Related <span className="text-primary">Projects</span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {relatedProjects.map((rp: any, idx: number) => (
                <ProjectCard key={rp.id} project={rp} index={idx} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
