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
import prisma from "@/lib/prisma";

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

    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile) {
      return NextResponse.json(
        { error: `No profile found for ${email}. Log in once first so a profile is created, then call this endpoint again.` },
        { status: 404 }
      );
    }

    const updated = await prisma.profile.update({
      where: { email },
      data: { role: "admin" },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    console.error("[api/admin/setup]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
