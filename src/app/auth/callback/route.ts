import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createReferralCode, recordReferral } from "@/lib/referral";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const ref = searchParams.get("ref");

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Ensure profile exists (for OAuth users signing in for the first time)
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

          // Record referral if code was provided
          if (ref) {
            await recordReferral(ref, user.id, name);
          }
        }
      }

      return NextResponse.redirect(`${origin}/dashboard/my-learning`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
