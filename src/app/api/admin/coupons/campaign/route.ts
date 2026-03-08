import { NextRequest, NextResponse } from "next/server";
import { getUser, createAdminSupabaseClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import CoinRewardEmail from "@emails/CoinRewardEmail";
import { z } from "zod";

// Lazily initialized to avoid build-time errors when env vars are unavailable
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const campaignSchema = z.object({
  discountPercent: z.number().min(1).max(100),
  expiryDays: z.number().min(1).max(365),
  targetSegment: z.enum(["all", "inactive"]),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createAdminSupabaseClient();

    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = campaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { discountPercent, expiryDays, targetSegment } = parsed.data;

    let targetUsers: { user_id: string; email: string; name: string }[] = [];

    if (targetSegment === "inactive") {
      // Get profiles that have no purchases in the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentBuyers } = await db
        .from("purchases")
        .select("user_id")
        .gte("created_at", thirtyDaysAgo);

      const recentBuyerIds = new Set((recentBuyers ?? []).map((p: { user_id: string }) => p.user_id));

      const { data: allProfiles } = await db
        .from("profiles")
        .select("user_id, email, name");

      targetUsers = (allProfiles ?? []).filter((p: { user_id: string }) => !recentBuyerIds.has(p.user_id));
    } else {
      const { data: allProfiles } = await db
        .from("profiles")
        .select("user_id, email, name");

      targetUsers = allProfiles ?? [];
    }

    const expiresAt = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000
    ).toISOString();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.codehunters.dev";
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "Code Hunters <noreply@codehunters.dev>";

    let sent = 0;

    const results = await Promise.allSettled(
      targetUsers.map(async (targetUser) => {
        const code = `CAMPAIGN-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;

        await db.from("coupons").insert({
          code,
          discount: discountPercent,
          type: "percent",
          expires_at: expiresAt,
          usage_limit: 1,
          user_id: targetUser.user_id,
          source: "campaign",
        });

        try {
          await getResend().emails.send({
            from: fromEmail,
            to: targetUser.email,
            subject: `🎁 ${discountPercent}% off — exclusive Code Hunters coupon inside!`,
            react: CoinRewardEmail({
              name: targetUser.name,
              couponCode: code,
              goldCoins: 0,
              dashboardUrl: `${appUrl}/courses`,
            }),
          });
          sent++;
        } catch (err) {
          console.error(
            `Campaign email failed for ${targetUser.email}:`,
            err
          );
        }
      })
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed, total: targetUsers.length });
  } catch (error) {
    console.error("Campaign error:", error);
    return NextResponse.json(
      { error: "Failed to send campaign" },
      { status: 500 }
    );
  }
}
