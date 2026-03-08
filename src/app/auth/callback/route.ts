import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { createReferralCode, recordReferral } from "@/lib/referral";
import { sendWelcomeEmail } from "@/lib/email";

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
        // Wrapped in try/catch so a DB failure does NOT block the login redirect.
        try {
          const db = createAdminSupabaseClient();
          const { data: existingProfile } = await db
            .from("profiles")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!existingProfile) {
            const referralCode = await createReferralCode();
            const name =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User";

            await db.from("profiles").insert({
              user_id: user.id,
              email: user.email || "",
              name,
              referral_code: referralCode,
            });

            // Record referral if code was provided
            if (ref) {
              await recordReferral(ref, user.id, name);
            }

            // Send welcome email + log it
            if (user.email) {
              sendWelcomeEmail(user.email, name, referralCode);
              const { error: logErr } = await db.from("email_logs")
                .insert({ user_id: user.id, email_type: "welcome" });
              if (logErr) console.error("Failed to log welcome email:", logErr);
            }
          }
        } catch (profileErr) {
          // Profile creation failed (DB unreachable, etc.) — log but don't block login
          console.error("[auth/callback] Profile creation failed:", profileErr);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard/my-learning`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
