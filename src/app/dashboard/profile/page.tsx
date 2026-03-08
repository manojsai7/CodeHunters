import { redirect } from "next/navigation";
import { getUser, createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfilePage() {
  try {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
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
          avatarUrl: profile.avatar_url || "",
          studentVerified: profile.student_verified,
          studentEmail: profile.student_email || "",
        }}
      />
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    console.error("[profile] Failed to load data:", e);
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted">Something went wrong loading your profile. Please try again later.</p>
      </div>
    );
  }
}
