import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfilePage() {
  try {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  // Profile guaranteed by layout auto-create; redirect to overview if still missing.
  if (!profile) redirect("/dashboard/my-learning");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-muted">
          Manage your account information and preferences.
        </p>
      </div>

      <ProfileForm
        profile={{
          name: profile.name,
          email: profile.email,
          phone: profile.phone || "",
          state: profile.state || "",
          avatarUrl: profile.avatarUrl || "",
          studentVerified: profile.studentVerified,
          studentEmail: profile.studentEmail || "",
        }}
      />
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    redirect("/login?error=true");
  }
}
