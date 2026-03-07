import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
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

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    // Use ?error=true so the middleware does NOT auto-redirect this authenticated
    // user back to the dashboard — that would create an infinite redirect loop.
    redirect("/login?error=true");
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
