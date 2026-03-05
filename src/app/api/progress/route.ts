import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, courseId, isCompleted } = body;

    if (!lessonId || !courseId) {
      return NextResponse.json(
        { error: "lessonId and courseId are required" },
        { status: 400 }
      );
    }

    // Verify user has purchased the course
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId,
        status: "completed",
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "You have not purchased this course" },
        { status: 403 }
      );
    }

    // Verify the lesson belongs to the course
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found in this course" },
        { status: 404 }
      );
    }

    // Upsert lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      create: {
        userId: user.id,
        lessonId,
        completed: isCompleted ?? true,
      },
      update: {
        completed: isCompleted ?? true,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
