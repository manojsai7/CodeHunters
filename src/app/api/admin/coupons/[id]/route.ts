import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

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
      .from("coupons")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const body = await request.json();

    // Only allow updating specific fields
    const updateData: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") updateData.is_active = body.isActive;
    if (typeof body.discount === "number") updateData.discount = body.discount;
    if (typeof body.usageLimit === "number") updateData.usage_limit = body.usageLimit;
    if (body.expiresAt) updateData.expires_at = new Date(body.expiresAt).toISOString();

    const { data: updated } = await db
      .from("coupons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update coupon error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
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
      .from("coupons")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Deactivate rather than hard delete
    await db
      .from("coupons")
      .update({ is_active: false })
      .eq("id", id);

    return NextResponse.json({ message: "Coupon deactivated successfully" });
  } catch (error) {
    console.error("Admin delete coupon error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate coupon" },
      { status: 500 }
    );
  }
}
