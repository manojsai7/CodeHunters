import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { safeJsonParse } from "@/lib/utils";

const createReviewSchema = z.object({
  courseId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await safeJsonParse(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId, rating, comment } = parsed.data;
    const db = createAdminSupabaseClient();

    // Check course exists
    const { data: course } = await db
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check user has purchased the course
    const { data: purchase } = await db
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "completed")
      .maybeSingle();

    if (!purchase) {
      return NextResponse.json(
        { error: "You must purchase this course before leaving a review" },
        { status: 403 }
      );
    }

    // Check if user already reviewed
    const { data: existingReview } = await db
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this course" },
        { status: 409 }
      );
    }

    // Get user profile for name
    const { data: profile } = await db
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();

    // Create review
    const { data: review, error: reviewError } = await db
      .from("reviews")
      .insert({
        user_id: user.id,
        course_id: courseId,
        rating,
        comment,
        user_name: profile?.name ?? "Anonymous",
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    // Recompute course average rating and review count
    const { data: allReviews } = await db
      .from("reviews")
      .select("rating")
      .eq("course_id", courseId);

    const reviewCount = allReviews?.length ?? 0;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            ((allReviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10)
          ) / 10
        : 0;

    await db
      .from("courses")
      .update({ rating: avgRating, review_count: reviewCount })
      .eq("id", courseId);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    const db = createAdminSupabaseClient();

    const { data: reviews } = await db
      .from("reviews")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json(reviews ?? []);
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
