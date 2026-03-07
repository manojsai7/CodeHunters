/**
 * POST /api/admin/set-role
 * Owner-only endpoint. Sets a user's role to "admin" or "student".
 * Owner role can only be granted via SQL — never via this API.
 */
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.profile.findUnique({ where: { userId: user.id } });
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

  const target = await prisma.profile.findUnique({ where: { email } });
  if (!target) {
    return NextResponse.json({ error: `No profile found for ${email}.` }, { status: 404 });
  }

  // Prevent changing another owner's role
  if (target.role === "owner") {
    return NextResponse.json({ error: "Cannot change role of another owner." }, { status: 403 });
  }

  await prisma.profile.update({ where: { email }, data: { role } });

  // If submitted via HTML form, redirect back to the admins page
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return NextResponse.redirect(new URL("/admin/admins", req.url));
  }

  return NextResponse.json({ success: true, email, role });
}
