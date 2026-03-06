import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  REFERRAL_COINS_PER_PURCHASE,
  COINS_FOR_COUPON_THRESHOLD,
  COUPON_DISCOUNT_PERCENT,
  SITE_CONFIG,
} from "@/utils/constants";
import {
  Coins,
  Gift,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReferralActions } from "@/components/dashboard/referral-actions";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Referrals & Gold Coins",
};

export default async function ReferralsPage() {
  try {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/login");

  const referrals = await prisma.referralUse.findMany({
    where: { referrerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Check for auto-generated coupons owned by this user
  const coupons = await prisma.coupon.findMany({
    where: { userId: user.id, isActive: true, source: "referral_reward" },
    orderBy: { createdAt: "desc" },
  });

  const shareUrl = `${SITE_CONFIG.url}/register?ref=${profile.referralCode}`;
  const coinsToNextCoupon = COINS_FOR_COUPON_THRESHOLD - (profile.goldCoins % COINS_FOR_COUPON_THRESHOLD);
  const progressToNextCoupon = Math.round(
    ((COINS_FOR_COUPON_THRESHOLD - coinsToNextCoupon) / COINS_FOR_COUPON_THRESHOLD) * 100
  );

  const howItWorks = [
    {
      step: "1",
      title: "Share Your Code",
      desc: `Share your referral code or link with friends.`,
    },
    {
      step: "2",
      title: "They Sign Up",
      desc: "Your friend registers using your referral code.",
    },
    {
      step: "3",
      title: "Earn Coins",
      desc: `You earn ${REFERRAL_COINS_PER_PURCHASE} gold coins for each referral who makes a purchase.`,
    },
    {
      step: "4",
      title: "Redeem Coupons",
      desc: `Collect ${COINS_FOR_COUPON_THRESHOLD} coins to unlock a ${COUPON_DISCOUNT_PERCENT}% discount coupon.`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Referrals & Gold Coins
        </h1>
        <p className="mt-1 text-muted">
          Earn rewards by inviting friends to Code Hunters.
        </p>
      </div>

      {/* Gold coins balance */}
      <Card className="border-gold/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 pointer-events-none" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 border border-gold/20">
                <Coins className="h-8 w-8 text-gold" />
              </div>
              <div>
                <p className="text-sm text-gold/80">Your Gold Coins</p>
                <p className="text-4xl font-bold text-gold">
                  {profile.goldCoins}
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:text-right">
              <p className="text-xs text-muted">Progress to next coupon</p>
              <div className="mt-1.5 w-48">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gold">{COINS_FOR_COUPON_THRESHOLD - coinsToNextCoupon} / {COINS_FOR_COUPON_THRESHOLD}</span>
                  <span className="text-muted">{progressToNextCoupon}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold transition-all"
                    style={{ width: `${progressToNextCoupon}%` }}
                  />
                </div>
              </div>
              {coinsToNextCoupon > 0 && (
                <p className="mt-1 text-xs text-muted">
                  {coinsToNextCoupon} more coins for a {COUPON_DISCOUNT_PERCENT}% coupon
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral code + sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReferralActions
            referralCode={profile.referralCode}
            shareUrl={shareUrl}
          />
        </CardContent>
      </Card>

      {/* Available coupons */}
      {coupons.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="h-5 w-5 text-gold" />
            Your Reward Coupons
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {coupons.map((coupon: typeof coupons[number]) => (
              <Card key={coupon.id} className="border-gold/20">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-mono text-lg font-bold text-gold">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-muted">
                      {coupon.discount}% off • Expires{" "}
                      {formatDate(coupon.expiresAt)}
                    </p>
                  </div>
                  <Badge variant="gold">Active</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-white">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item) => (
            <Card key={item.step}>
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary mb-3">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Referral history */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-secondary" />
          Referral History
        </h2>
        {referrals.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface/50">
                      <th className="px-5 py-3 text-left font-medium text-muted">
                        Referred User
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-muted">
                        Joined
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-muted">
                        Purchase Made
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-muted">
                        Coins
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {referrals.map((ref: typeof referrals[number]) => (
                      <tr
                        key={ref.id}
                        className="hover:bg-surface-hover transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-white">
                          {ref.referredName}
                        </td>
                        <td className="px-5 py-3 text-muted">
                          {formatDate(ref.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          {ref.purchaseMade ? (
                            <Badge variant="success">Yes</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {ref.coinsAwarded ? (
                            <span className="flex items-center gap-1 text-gold font-medium">
                              <Coins className="h-3.5 w-3.5" />+
                              {REFERRAL_COINS_PER_PURCHASE}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Gift className="mb-3 h-10 w-10 text-muted" />
              <p className="text-sm text-muted">
                No referrals yet. Share your code to start earning!
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    redirect("/login");
  }
}
