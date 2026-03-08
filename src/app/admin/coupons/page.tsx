import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { CouponsClient } from "./coupons-client";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Manage Coupons — Admin",
};

export default async function AdminCouponsPage() {
  try {
  const db = createAdminSupabaseClient();

  const { data: coupons } = await db
    .from("coupons")
    .select("*, profiles(name, email)")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (coupons ?? []).map((c: any) => ({
    id: c.id,
    code: c.code,
    discount: c.discount,
    type: c.type,
    expiresAt: c.expires_at,
    usageLimit: c.usage_limit,
    usedCount: c.used_count,
    isActive: c.is_active,
    source: c.source,
    userName: c.profiles?.name ?? null,
    createdAt: c.created_at,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <p className="text-sm text-muted mt-1">{data.length} total coupons</p>
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
