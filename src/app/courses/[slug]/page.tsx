import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Share2,
  ShoppingCart,
  PlayCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseReviews } from "@/components/courses/course-reviews";
import { CourseCard } from "@/components/courses/course-card";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = 'force-dynamic';

type CourseWithRelations = Awaited<ReturnType<typeof getCourseWithRelations>>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getCourseWithRelations(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: { lessons: true, reviews: true },
  });
}

type ReviewItem = NonNullable<CourseWithRelations>["reviews"][number];
type CourseItem = Awaited<ReturnType<typeof prisma.course.findMany>>[number];

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
    });

    if (!course || !course.isPublished) {
      return { title: "Course Not Found | Code Hunters" };
    }

    return {
      title: `${course.title} | Code Hunters`,
      description: course.shortDesc || course.description,
      openGraph: {
        title: `${course.title} | Code Hunters`,
        description: course.shortDesc || course.description,
        images: course.thumbnail ? [{ url: course.thumbnail }] : [],
      },
    };
  } catch {
    return { title: "Course Not Found | Code Hunters" };
  }
}

function formatTotalDuration(seconds: number) {
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default async function CourseDetailPage({ params }: PageProps) {
  let course;
  try {
    course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!course || !course.isPublished) {
    notFound();
  }

  // Auth + purchase check
  let userData = null;
  let hasPurchased = false;

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

      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
          status: "paid",
        },
      });
      hasPurchased = !!purchase;
    }
  } catch {
    // Not authenticated
  }

  // Related courses (same category, exclude current)
  let relatedCourses: CourseItem[] = [];
  try {
    relatedCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        category: course.category,
        id: { not: course.id },
      },
      take: 3,
      orderBy: { purchasesCount: "desc" },
    });
  } catch {
    // Database unavailable — skip related courses
  }

  const totalDuration = course.lessons.reduce((a: number, l: { duration: number }) => a + l.duration, 0);
  const hasSale = course.price < course.mrp;
  const discountPercent = hasSale
    ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
          <Link href="/courses" className="hover:text-white transition-colors">
            Courses
          </Link>
          <span>/</span>
          <span className="text-white truncate">{course.title}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* ────── LEFT COLUMN ────── */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Title + Badges */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="default">{course.category}</Badge>
                <Badge variant="secondary">{course.difficulty}</Badge>
                {course.isBestseller && (
                  <Badge variant="bestseller">Bestseller</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl leading-tight">
                {course.title}
              </h1>

              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold text-gold">
                    {course.rating.toFixed(1)}
                  </span>
                  <span>
                    ({course.reviewCount}{" "}
                    {course.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {course.purchasesCount.toLocaleString()} students
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons.length} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTotalDuration(totalDuration)}</span>
                </div>
              </div>

              {course.instructorName && (
                <p className="mt-3 text-sm text-muted">
                  Instructor:{" "}
                  <span className="text-white font-medium">
                    {course.instructorName}
                  </span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">About this Course</h2>
              <div className="prose prose-invert max-w-none text-muted leading-relaxed">
                <p>{course.description}</p>
                {course.shortDesc && (
                  <p className="mt-3">{course.shortDesc}</p>
                )}
              </div>
            </div>

            {/* Curriculum */}
            <CourseCurriculum
              lessons={course.lessons}
              hasPurchased={hasPurchased}
            />

            {/* Reviews */}
            <CourseReviews
              reviews={course.reviews.map((r: ReviewItem) => ({
                ...r,
                createdAt: r.createdAt.toISOString(),
              }))}
              averageRating={course.rating}
              totalReviews={course.reviewCount}
              hasPurchased={hasPurchased}
            />
          </div>

          {/* ────── RIGHT SIDEBAR ────── */}
          <aside className="w-full shrink-0 lg:w-[380px]">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Card */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/20">
                      <PlayCircle className="h-16 w-16 text-white/40" />
                    </div>
                  )}
                  {course.previewVideoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 shadow-lg shadow-primary/30">
                        <PlayCircle className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-5">
                  {/* Price */}
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(course.price)}
                    </span>
                    {hasSale && (
                      <>
                        <span className="text-lg text-muted line-through">
                          {formatPrice(course.mrp)}
                        </span>
                        <Badge variant="error" className="text-xs font-bold">
                          {discountPercent}% OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Buy / Continue CTA */}
                  {hasPurchased ? (
                    <Link href={`/dashboard/my-learning`} className="block">
                      <Button size="lg" className="w-full">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/checkout/course/${course.slug}`}
                      className="block"
                    >
                      <Button size="lg" className="w-full">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Buy Now
                      </Button>
                    </Link>
                  )}

                  {/* Stats */}
                  <div className="space-y-3 border-t border-white/5 pt-5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Lessons</span>
                      <span className="text-white font-medium">
                        {course.lessons.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Duration</span>
                      <span className="text-white font-medium">
                        {formatTotalDuration(totalDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Students</span>
                      <span className="text-white font-medium">
                        {course.purchasesCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Rating</span>
                      <span className="flex items-center gap-1 text-white font-medium">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Difficulty</span>
                      <span className="text-white font-medium">
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {course.techTags.length > 0 && (
                    <div className="border-t border-white/5 pt-5">
                      <h4 className="mb-3 text-sm font-semibold text-white">
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {course.techTags.map((tag: string) => (
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
                    onClick={undefined}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share this course
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Related <span className="text-primary">Courses</span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCourses.map((rc: CourseItem, idx: number) => (
                <CourseCard key={rc.id} course={rc} index={idx} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
