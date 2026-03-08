import { Metadata } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Gift, TrendingUp, Coins, Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Referrals | Admin - Code Hunters",
};

export default async function AdminReferralsPage() {
  try {
  const db = createAdminSupabaseClient();

  const { data: referrals } = await db
    .from("referral_uses")
    .select("*, profiles!referral_uses_referrer_id_fkey(name, email)")
    .order("created_at", { ascending: false });

  const allReferrals = referrals ?? [];

  // Top referrers — aggregate from referral_uses
  const referrerMap: Record<string, { name: string; email: string; count: number }> = {};
  for (const r of allReferrals) {
    const rid = r.referrer_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = r.profiles as any;
    if (!referrerMap[rid]) {
      referrerMap[rid] = { name: profile?.name ?? "Unknown", email: profile?.email ?? "", count: 0 };
    }
    referrerMap[rid].count++;
  }

  // Get gold coins for top referrers
  const topReferrerIds = Object.entries(referrerMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  const { data: referrerProfiles } = await db
    .from("profiles")
    .select("user_id, gold_coins")
    .in("user_id", topReferrerIds.map(([id]) => id));

  const coinsMap: Record<string, number> = {};
  for (const p of referrerProfiles ?? []) {
    coinsMap[p.user_id] = p.gold_coins ?? 0;
  }

  const topReferrers = topReferrerIds.map(([id, info]) => ({
    ...info,
    goldCoins: coinsMap[id] ?? 0,
  }));

  const totalCoinsAwarded = allReferrals.filter((r) => r.coins_awarded).length * 15;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Referral Analytics</h1>
        <p className="text-muted">Track referral performance and coin distribution</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface/30 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-muted text-sm">Total Referrals</p>
              <p className="text-2xl font-bold text-white">{allReferrals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface/30 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/20 rounded-lg">
              <Coins className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-muted text-sm">Total Coins Awarded</p>
              <p className="text-2xl font-bold text-gold">{totalCoinsAwarded}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface/30 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-muted text-sm">Active Referrers</p>
              <p className="text-2xl font-bold text-white">{topReferrers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-surface/30 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Referrers
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-sm font-medium text-muted">#</th>
              <th className="px-4 py-3 text-sm font-medium text-muted">User</th>
              <th className="px-4 py-3 text-sm font-medium text-muted">Referrals</th>
              <th className="px-4 py-3 text-sm font-medium text-muted">Gold Coins</th>
            </tr>
          </thead>
          <tbody>
            {topReferrers.map((referrer, i) => (
              <tr key={referrer.email} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-muted">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{referrer.name}</p>
                  <p className="text-sm text-muted">{referrer.email}</p>
                </td>
                <td className="px-4 py-3 text-white">{referrer.count}</td>
                <td className="px-4 py-3">
                  <span className="text-gold font-medium">{referrer.goldCoins}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Referrals */}
      <div className="bg-surface/30 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Recent Referral Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted">Referrer</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Referred User</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Coins</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {allReferrals.slice(0, 20).map((ref) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const refProfile = ref.profiles as any;
                return (
                <tr key={ref.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="text-white">{refProfile?.name}</p>
                    <p className="text-sm text-muted">{refProfile?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{ref.referred_name}</p>
                    <p className="text-sm text-muted">{ref.referred_user_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="gold">{ref.coins_awarded ? "+15" : "Pending"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">
                    {formatDate(ref.created_at)}
                  </td>
                </tr>
                );
              })}
              {allReferrals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted">
                    No referrals yet
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
        <h2 className="text-xl font-bold text-white">Unable to load referrals</h2>
        <p className="mt-2 text-sm text-muted">Database connection unavailable. Please try again later.</p>
      </div>
    );
  }
}
