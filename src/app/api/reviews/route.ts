import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { z } from "zod";

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

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId, rating, comment } = parsed.data;

    // Check course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check user has purchased the course
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId,
        status: "completed",
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "You must purchase this course before leaving a review" },
        { status: 403 }
      );
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this course" },
        { status: 409 }
      );
    }

    // Get user profile for name
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        courseId,
        rating,
        comment,
        userName: profile?.name ?? "Anonymous",
      },
    });

    // Recompute course average rating and review count
    const aggregation = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: {
        rating: Math.round((aggregation._avg.rating ?? 0) * 10) / 10,
        reviewCount: aggregation._count.rating,
      },
    });

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

    const reviews = await prisma.review.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
