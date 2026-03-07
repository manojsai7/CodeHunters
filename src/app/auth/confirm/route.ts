import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { createReferralCode, recordReferral } from "@/lib/referral";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const existingProfile = await prisma.profile.findUnique({
          where: { userId: user.id },
        });

        if (!existingProfile) {
          const referralCode = await createReferralCode();
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";

          await prisma.profile.create({
            data: {
              userId: user.id,
              email: user.email || "",
              name,
              referralCode,
            },
          });

          const ref = user.user_metadata?.referral_code as string | undefined;
          if (ref) {
            await recordReferral(ref, user.id, name);
          }

          if (user.email) {
            sendWelcomeEmail(user.email, name, referralCode);
            prisma.emailLog
              .create({
                data: { userId: user.id, emailType: "welcome" },
              })
              .catch((err: unknown) =>
                console.error("Failed to log welcome email:", err)
              );
          }
        }
      }

      return NextResponse.redirect(`${origin}/dashboard/my-learning`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation`);
}
