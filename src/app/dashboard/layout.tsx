import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { createReferralCode } from "@/lib/referral";
import { Navbar } from "@/components/layout/navbar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Try to load profile from DB — fall back to auth metadata if DB is unreachable.
  let profile: {
    email: string; name: string; role: string; goldCoins: number; avatarUrl: string | null;
  } | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: dbProfile } = await supabase
      .from("profiles")
      .select("email, name, role, gold_coins, avatar_url, referral_code")
      .eq("user_id", user.id)
      .single();

    if (!dbProfile) {
      const referralCode = await createReferralCode();
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";
      await supabase.from("profiles").insert({
        user_id: user.id,
        email: user.email ?? "",
        name,
        referral_code: referralCode,
      });
      profile = { email: user.email ?? "", name, role: "student", goldCoins: 0, avatarUrl: null };
    } else {
      profile = {
        email: dbProfile.email,
        name: dbProfile.name,
        role: dbProfile.role,
        goldCoins: dbProfile.gold_coins,
        avatarUrl: dbProfile.avatar_url,
      };
    }
  } catch (dbErr) {
    console.error("[dashboard/layout] DB unavailable, using auth metadata:", dbErr);
    profile = {
      email: user.email ?? "",
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User",
      role: "student",
      goldCoins: 0,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={{
          id: user.id,
          email: profile!.email,
          name: profile!.name,
          role: profile!.role,
          goldCoins: profile!.goldCoins,
        }}
      />

      <DashboardSidebar
        profile={{
          name: profile!.name,
          email: profile!.email,
          role: profile!.role,
          goldCoins: profile!.goldCoins,
          avatarUrl: profile!.avatarUrl,
        }}
      />

      <main className="pt-16 lg:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
