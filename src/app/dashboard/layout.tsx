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
  try {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    // Profile missing — create it now so the user isn't stuck in a redirect loop.
    // This handles the case where the auth callback ran before the DB was ready.
    const referralCode = await createReferralCode();
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";
    profile = await prisma.profile.create({
      data: {
        userId: user.id,
        email: user.email ?? "",
        name,
        referralCode,
      },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={{
          id: user.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          goldCoins: profile.goldCoins,
        }}
      />

      <DashboardSidebar
        profile={{
          name: profile.name,
          email: profile.email,
          role: profile.role,
          goldCoins: profile.goldCoins,
          avatarUrl: profile.avatarUrl,
        }}
      />

      <main className="pt-16 lg:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
  } catch (e: unknown) {
    // Rethrow Next.js redirect/not-found errors (they carry a 'digest' property).
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    // For unexpected errors (e.g. DB unreachable), redirect with ?error=true so
    // the middleware does NOT bounce the user back to the dashboard and loop.
    redirect("/login?error=true");
  }
}
