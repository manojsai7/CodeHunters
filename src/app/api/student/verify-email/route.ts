import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { classifyEmail } from "@/utils/emailTrust";
import { sendStudentOtpEmail } from "@/lib/email";
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

    if (trustLevel === "blocked") {
      return NextResponse.json(
        { status: "blocked", message: "This email domain is not allowed." },
        { status: 400 }
      );
    }

    if (trustLevel === "consumer") {
      return NextResponse.json({
        status: "not_eligible",
        message:
          "Not a recognized educational email. Please use your college/university email.",
      });
    }

    // Student domain — generate OTP and send via Resend
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt,
        studentEmail: email,
      },
    });

    await sendStudentOtpEmail(email, profile.name, otp);

    return NextResponse.json({
      status: "otp_sent",
      message: "OTP sent to your student email. Check your inbox.",
    });
  } catch (error) {
    console.error("Student verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify student email" },
      { status: 500 }
    );
  }
}
