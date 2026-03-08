import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { courseSchema } from "@/lib/validations";

export async function GET() {
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

    const { data: courses } = await db
      .from("courses")
      .select("*, purchases(id), lessons(id), reviews(id)")
      .order("created_at", { ascending: false })
      .limit(200);

    // Add _count for compatibility
    const result = (courses ?? []).map((c: Record<string, unknown>) => ({
      ...c,
      _count: {
        purchases: Array.isArray(c.purchases) ? (c.purchases as unknown[]).length : 0,
        lessons: Array.isArray(c.lessons) ? (c.lessons as unknown[]).length : 0,
        reviews: Array.isArray(c.reviews) ? (c.reviews as unknown[]).length : 0,
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin list courses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = courseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const { data: existing } = await db
      .from("courses")
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "A course with this slug already exists" },
        { status: 409 }
      );
    }

    const { data: course } = await db
      .from("courses")
      .insert(parsed.data)
      .select()
      .single();

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Admin create course error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
