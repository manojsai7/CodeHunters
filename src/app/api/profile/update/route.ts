import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await safeJsonParse(request);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { name, phone, state, avatarUrl } = body as { name?: string; phone?: string; state?: string; avatarUrl?: string };

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        name: name.trim(),
        phone: phone || null,
        state: state || null,
        avatarUrl: avatarUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        state: updatedProfile.state,
        avatarUrl: updatedProfile.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
