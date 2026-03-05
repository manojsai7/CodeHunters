import prisma from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import {
  REFERRAL_COINS_PER_PURCHASE,
  COINS_FOR_COUPON_THRESHOLD,
  COUPON_DISCOUNT_PERCENT,
} from "@/utils/constants";

export async function createReferralCode(): Promise<string> {
  let code: string;
  let exists = true;

  do {
    code = generateReferralCode();
    const existing = await prisma.profile.findUnique({
      where: { referralCode: code },
    });
    exists = !!existing;
  } while (exists);

  return code;
}

export async function recordReferral(
  referralCode: string,
  newUserId: string,
  newUserName: string
): Promise<boolean> {
  try {
    const referrer = await prisma.profile.findUnique({
      where: { referralCode },
    });

    if (!referrer) return false;

    // Don't allow self-referral
    if (referrer.userId === newUserId) return false;

    // Check if already referred
    const existingRef = await prisma.referralUse.findUnique({
      where: { referredUserId: newUserId },
    });

    if (existingRef) return false;

    await prisma.referralUse.create({
      data: {
        referrerId: referrer.userId,
        referredUserId: newUserId,
        referredName: newUserName,
      },
    });

    return true;
  } catch (error) {
    console.error("Error recording referral:", error);
    return false;
  }
}

export async function creditReferralCoins(
  referredUserId: string
): Promise<void> {
  try {
    const referralUse = await prisma.referralUse.findUnique({
      where: { referredUserId },
      include: { referrer: true },
    });

    if (!referralUse || referralUse.coinsAwarded) return;

    // Update the referral record
    await prisma.referralUse.update({
      where: { id: referralUse.id },
      data: { purchaseMade: true, coinsAwarded: true },
    });

    // Credit coins to referrer
    const updatedProfile = await prisma.profile.update({
      where: { userId: referralUse.referrerId },
      data: { goldCoins: { increment: REFERRAL_COINS_PER_PURCHASE } },
    });

    // Check if threshold crossed for auto-coupon
    if (updatedProfile.goldCoins >= COINS_FOR_COUPON_THRESHOLD) {
      // Check if we already created a reward coupon recently
      const recentRewardCoupon = await prisma.coupon.findFirst({
        where: {
          userId: referralUse.referrerId,
          source: "referral_reward",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!recentRewardCoupon) {
        const couponCode = `REWARD-${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}`;

        await prisma.coupon.create({
          data: {
            code: couponCode,
            discount: COUPON_DISCOUNT_PERCENT,
            type: "percent",
            expiresAt: new Date(
              Date.now() + 6 * 30 * 24 * 60 * 60 * 1000 // 6 months
            ),
            usageLimit: 1,
            userId: referralUse.referrerId,
            source: "referral_reward",
          },
        });

        // Fire n8n webhook for reward notification
        await triggerN8nWebhook("referral-reward", {
          userId: referralUse.referrerId,
          couponCode,
          goldCoins: updatedProfile.goldCoins,
          email: referralUse.referrer.email,
          name: referralUse.referrer.name,
        });
      }
    }
  } catch (error) {
    console.error("Error crediting referral coins:", error);
  }
}

export async function triggerN8nWebhook(
  webhookType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  if (!baseUrl) {
    console.warn("N8N_WEBHOOK_BASE_URL not configured");
    return;
  }

  const webhookMap: Record<string, string | undefined> = {
    enrollment: process.env.N8N_ENROLLMENT_WEBHOOK,
    "student-otp": process.env.N8N_STUDENT_OTP_WEBHOOK,
    "referral-reward": process.env.N8N_REFERRAL_REWARD_WEBHOOK,
    onboarding: process.env.N8N_ONBOARDING_WEBHOOK,
    "coupon-campaign": process.env.N8N_COUPON_CAMPAIGN_WEBHOOK,
  };

  const webhookId = webhookMap[webhookType];
  if (!webhookId) {
    console.warn(`No webhook configured for type: ${webhookType}`);
    return;
  }

  try {
    await fetch(`${baseUrl}/${webhookId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        type: webhookType,
      }),
    });
  } catch (error) {
    console.error(`Failed to trigger n8n webhook (${webhookType}):`, error);
  }
}
