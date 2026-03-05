import prisma from "@/lib/prisma";
import { CouponsClient } from "./coupons-client";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Manage Coupons — Admin",
};

export default async function AdminCouponsPage() {
  try {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { name: true, email: true } },
    },
  });

  const data = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discount: c.discount,
    type: c.type,
    expiresAt: c.expiresAt.toISOString(),
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    isActive: c.isActive,
    source: c.source,
    userName: c.profile?.name ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <p className="text-sm text-muted mt-1">{coupons.length} total coupons</p>
      </div>

      <CouponsClient data={data} />
    </div>
  );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-white">Unable to load coupons</h2>
        <p className="mt-2 text-sm text-muted">Database connection unavailable. Please try again later.</p>
      </div>
    );
  }
}
