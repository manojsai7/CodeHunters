import { redirect } from "next/navigation";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin Panel — Code Hunters",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const db = createAdminSupabaseClient();
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !isAdmin(profile.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar role={profile.role} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    redirect("/login");
  }
}
