import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { safeJsonParse } from "@/lib/utils";
import { z } from "zod";

const verifyOtpSchema = z.object({
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 10 minutes per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`otp:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await safeJsonParse(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
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
