/**
 * POST /api/admin/set-role
 * Owner-only endpoint. Sets a user's role to "admin" or "student".
 * Owner role can only be granted via SQL — never via this API.
 */
import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminSupabaseClient();

  const { data: me } = await db
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (me?.role !== "owner") {
    return NextResponse.json({ error: "Only the owner can set roles." }, { status: 403 });
  }

  // Accept both JSON and form submissions
  let email: string | null = null;
  let role: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    email = body.email;
    role = body.role;
  } else {
    const formData = await req.formData();
    email = formData.get("email") as string | null;
    role = formData.get("role") as string | null;
  }

  if (!email || !role) {
    return NextResponse.json({ error: "email and role are required." }, { status: 400 });
  }

  // Only allow setting admin or student — never owner via API
  if (!["admin", "student"].includes(role)) {
    return NextResponse.json({ error: "Role must be 'admin' or 'student'." }, { status: 400 });
  }

  const { data: target } = await db
    .from("profiles")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: `No profile found for ${email}.` }, { status: 404 });
  }

  // Prevent changing another owner's role
  if (target.role === "owner") {
    return NextResponse.json({ error: "Cannot change role of another owner." }, { status: 403 });
  }

  await db.from("profiles").update({ role }).eq("email", email);

  // If submitted via HTML form, redirect back to the admins page
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return NextResponse.redirect(new URL("/admin/admins", req.url));
  }

  return NextResponse.json({ success: true, email, role });
}
