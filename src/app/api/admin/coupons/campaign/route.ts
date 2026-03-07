import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { Resend } from "resend";
import CoinRewardEmail from "@emails/CoinRewardEmail";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (profile?.role !== "admin") {
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

    // Get target users
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    const whereClause =
      targetSegment === "inactive"
        ? {
            purchases: { none: { createdAt: { gte: thirtyDaysAgo } } },
          }
        : {};

    const targetUsers = await prisma.profile.findMany({
      where: whereClause,
      select: { userId: true, email: true, name: true },
    });

    const expiresAt = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000
    );
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

        await prisma.coupon.create({
          data: {
            code,
            discount: discountPercent,
            type: "percent",
            expiresAt,
            usageLimit: 1,
            userId: targetUser.userId,
            source: "campaign",
          },
        });

        try {
          await resend.emails.send({
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
