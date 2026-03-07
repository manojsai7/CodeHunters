import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { z } from "zod";

const verifyOtpSchema = z.object({
  otp: z.string().length(6),
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
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid OTP format", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { otp } = parsed.data;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (!profile.otpCode || !profile.otpExpiresAt) {
      return NextResponse.json(
        { error: "No OTP was requested. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > profile.otpExpiresAt) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { otpCode: null, otpExpiresAt: null },
      });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (profile.otpCode !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP. Please check and try again." },
        { status: 400 }
      );
    }

    // OTP matches — verify student
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        studentVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return NextResponse.json({
      verified: true,
      message: "Student email verified successfully!",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
