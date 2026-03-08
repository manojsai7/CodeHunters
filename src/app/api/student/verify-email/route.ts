import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { classifyEmail } from "@/utils/emailTrust";
import { sendStudentOtpEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { safeJsonParse } from "@/lib/utils";
import { z } from "zod";

const verifyEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 OTP sends per 15 minutes per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`verify-email:${ip}`, 3, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
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
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    const db = createAdminSupabaseClient();

    const { data: profile } = await db
      .from("profiles")
      .update({
        otp_code: otp,
        otp_expires_at: otpExpiresAt,
        student_email: email,
      })
      .eq("user_id", user.id)
      .select("name")
      .single();

    await sendStudentOtpEmail(email, profile?.name ?? "Student", otp);

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
