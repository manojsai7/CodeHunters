import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Gift, TrendingUp, Coins, Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Referrals | Admin - Code Hunters",
};

export default async function AdminReferralsPage() {
  try {
  const referrals = await prisma.referralUse.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      referrer: { select: { name: true, email: true } },
    },
  });

  // Top referrers
  const topReferrers = await prisma.profile.findMany({
    where: {
      referralsMade: { some: {} },
    },
    select: {
      name: true,
      email: true,
      goldCoins: true,
      _count: { select: { referralsMade: true } },
    },
    orderBy: {
      referralsMade: { _count: "desc" },
    },
    take: 10,
  });

  const totalCoinsAwarded = referrals.filter((r) => r.coinsAwarded).length * 15;

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
              <p className="text-2xl font-bold text-white">{referrals.length}</p>
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
                <td className="px-4 py-3 text-white">{referrer._count.referralsMade}</td>
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
              {referrals.slice(0, 20).map((ref) => (
                <tr key={ref.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="text-white">{ref.referrer.name}</p>
                    <p className="text-sm text-muted">{ref.referrer.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{ref.referredName}</p>
                    <p className="text-sm text-muted">{ref.referredUserId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="gold">{ref.coinsAwarded ? "+15" : "Pending"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">
                    {formatDate(ref.createdAt)}
                  </td>
                </tr>
              ))}
              {referrals.length === 0 && (
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
