/**
 * One-time admin bootstrap route.
 *
 * POST /api/admin/setup
 * Body: { "email": "you@example.com", "secret": "<INTERNAL_SECRET>" }
 *
 * Sets the matching profile's role to "admin".
 * Secured by INTERNAL_SECRET env var — keep this secret.
 */
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, secret } = body as { email?: string; secret?: string };

    const internalSecret = process.env.INTERNAL_SECRET;

    if (!internalSecret) {
      return NextResponse.json(
        { error: "INTERNAL_SECRET env var not set on server." },
        { status: 500 }
      );
    }

    if (!secret || secret !== internalSecret) {
      return NextResponse.json({ error: "Invalid secret." }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: "email is required." }, { status: 400 });
    }

    const db = createAdminSupabaseClient();

    const { data: profile } = await db
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: `No profile found for ${email}. Log in once first so a profile is created, then call this endpoint again.` },
        { status: 404 }
      );
    }

    const { data: updated } = await db
      .from("profiles")
      .update({ role: "admin" })
      .eq("email", email)
      .select("id, email, name, role")
      .single();

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    console.error("[api/admin/setup]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
