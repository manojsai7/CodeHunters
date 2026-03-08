import { Metadata } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Users, GraduationCap, Coins } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Users | Admin - Code Hunters",
};

export default async function AdminUsersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  try {
  const searchParams = await searchParamsPromise;
  const search = searchParams.search || "";

  const db = createAdminSupabaseClient();

  let query = db
    .from("profiles")
    .select("*, purchases(id), referral_uses!referral_uses_referrer_id_fkey(id)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: rawUsers } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = (rawUsers ?? []).map((u: any) => ({
    ...u,
    purchaseCount: Array.isArray(u.purchases) ? u.purchases.length : 0,
    referralCount: Array.isArray(u.referral_uses) ? u.referral_uses.length : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-muted">{users.length} registered users</p>
        </div>
      </div>

      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-white/10 rounded-lg text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </form>

      <div className="bg-surface/30 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted">User</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Role</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Gold Coins</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Student</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Purchases</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Referrals</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.user_id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-sm text-muted">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-gold">
                      <Coins className="h-4 w-4" />
                      {user.gold_coins}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.student_verified ? (
                      <Badge variant="success">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <span className="text-muted text-sm">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {user.purchaseCount}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {user.referralCount}
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-white">Unable to load users</h2>
        <p className="mt-2 text-sm text-muted">Database connection unavailable. Please try again later.</p>
      </div>
    );
  }
}
