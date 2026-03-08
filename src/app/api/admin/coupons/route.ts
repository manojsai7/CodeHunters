import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { couponSchema } from "@/lib/validations";

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

    const { data: coupons } = await db
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    return NextResponse.json(coupons ?? []);
  } catch (error) {
    console.error("Admin list coupons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
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
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check code uniqueness
    const { data: existing } = await db
      .from("coupons")
      .select("id")
      .eq("code", parsed.data.code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 }
      );
    }

    const { data: coupon } = await db
      .from("coupons")
      .insert({
        code: parsed.data.code,
        discount: parsed.data.discount,
        type: parsed.data.type,
        expires_at: new Date(parsed.data.expiresAt).toISOString(),
        usage_limit: parsed.data.usageLimit,
        source: "manual",
      })
      .select()
      .single();

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Admin create coupon error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
