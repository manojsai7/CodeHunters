import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { courseSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = createAdminSupabaseClient();

    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: course } = await db
      .from("courses")
      .select("*, lessons(*), purchases(id), reviews(id)")
      .eq("id", id)
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Sort lessons by order
    if (Array.isArray(course.lessons)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course.lessons.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    }

    // Add _count for compatibility
    const result = {
      ...course,
      _count: {
        purchases: Array.isArray(course.purchases) ? course.purchases.length : 0,
        reviews: Array.isArray(course.reviews) ? course.reviews.length : 0,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin get course error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = createAdminSupabaseClient();

    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: existing } = await db
      .from("courses")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = courseSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // If slug is changed, check uniqueness
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const { data: slugTaken } = await db
        .from("courses")
        .select("id")
        .eq("slug", parsed.data.slug)
        .maybeSingle();

      if (slugTaken) {
        return NextResponse.json(
          { error: "A course with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const { data: updated } = await db
      .from("courses")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update course error:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = createAdminSupabaseClient();

    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: existing } = await db
      .from("courses")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Soft delete: unpublish the course
    await db
      .from("courses")
      .update({ is_published: false })
      .eq("id", id);

    return NextResponse.json({ message: "Course unpublished successfully" });
  } catch (error) {
    console.error("Admin delete course error:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
