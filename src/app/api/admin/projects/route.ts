import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations";

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

    const { data: projects } = await db
      .from("projects")
      .select("*, purchases(id)")
      .order("created_at", { ascending: false })
      .limit(200);

    // Add _count for compatibility
    const result = (projects ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      _count: {
        purchases: Array.isArray(p.purchases) ? (p.purchases as unknown[]).length : 0,
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin list projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const { data: existing } = await db
      .from("projects")
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }

    const { data: project } = await db
      .from("projects")
      .insert(parsed.data)
      .select()
      .single();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Admin create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
