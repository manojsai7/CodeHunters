import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
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
    let dbProfile = await prisma.profile.findUnique({ where: { userId: user.id } });

    if (!dbProfile) {
      const referralCode = await createReferralCode();
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";
      dbProfile = await prisma.profile.create({
        data: { userId: user.id, email: user.email ?? "", name, referralCode },
      });
    }

    profile = {
      email: dbProfile.email,
      name: dbProfile.name,
      role: dbProfile.role,
      goldCoins: dbProfile.goldCoins,
      avatarUrl: dbProfile.avatarUrl,
    };
  } catch (dbErr) {
    // DB unreachable (e.g. DATABASE_URL not set) — fall back to auth metadata
    // so the user can at least see the dashboard shell while we diagnose.
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
