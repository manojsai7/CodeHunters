import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { classifyEmail } from "@/utils/emailTrust";
import { z } from "zod";

const verifyEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const trustLevel = classifyEmail(email);

    if (trustLevel === "student") {
      await prisma.profile.update({
        where: { userId: user.id },
        data: {
          studentVerified: true,
          studentEmail: email,
        },
      });

      return NextResponse.json({
        verified: true,
        message: "Student email verified successfully",
      });
    }

    return NextResponse.json({
      verified: false,
      message: "Not a recognized educational email. Please use your college/university email.",
    });
  } catch (error) {
    console.error("Student verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify student email" },
      { status: 500 }
    );
  }
}
