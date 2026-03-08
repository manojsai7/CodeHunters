import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/utils";
import { sendReferralRewardEmail } from "@/lib/email";
import {
  REFERRAL_COINS_PER_PURCHASE,
  COINS_FOR_COUPON_THRESHOLD,
  COUPON_DISCOUNT_PERCENT,
} from "@/utils/constants";

export async function createReferralCode(): Promise<string> {
  const db = createAdminSupabaseClient();
  let code: string;
  let exists = true;

  do {
    code = generateReferralCode();
    const { data: existing } = await db
      .from("profiles")
      .select("user_id")
      .eq("referral_code", code)
      .maybeSingle();
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
    const db = createAdminSupabaseClient();

    const { data: referrer } = await db
      .from("profiles")
      .select("user_id")
      .eq("referral_code", referralCode)
      .single();

    if (!referrer) return false;

    // Don't allow self-referral
    if (referrer.user_id === newUserId) return false;

    // Check if already referred
    const { data: existingRef } = await db
      .from("referral_uses")
      .select("id")
      .eq("referred_user_id", newUserId)
      .maybeSingle();

    if (existingRef) return false;

    await db.from("referral_uses").insert({
      referrer_id: referrer.user_id,
      referred_user_id: newUserId,
      referred_name: newUserName,
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
    const db = createAdminSupabaseClient();

    const { data: referralUse } = await db
      .from("referral_uses")
      .select("*, profiles!referral_uses_referrer_id_fkey(*)")
      .eq("referred_user_id", referredUserId)
      .maybeSingle();

    if (!referralUse || referralUse.coins_awarded) return;

    // Update the referral record
    await db
      .from("referral_uses")
      .update({ purchase_made: true, coins_awarded: true })
      .eq("id", referralUse.id);

    // Credit coins to referrer
    const { data: currentProfile } = await db
      .from("profiles")
      .select("gold_coins, email, name")
      .eq("user_id", referralUse.referrer_id)
      .single();

    if (!currentProfile) return;

    const newCoins = (currentProfile.gold_coins ?? 0) + REFERRAL_COINS_PER_PURCHASE;
    await db
      .from("profiles")
      .update({ gold_coins: newCoins })
      .eq("user_id", referralUse.referrer_id);

    // Check if threshold crossed for auto-coupon
    if (newCoins >= COINS_FOR_COUPON_THRESHOLD) {
      // Check if we already created a reward coupon recently
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentRewardCoupon } = await db
        .from("coupons")
        .select("id")
        .eq("user_id", referralUse.referrer_id)
        .eq("source", "referral_reward")
        .gte("created_at", oneDayAgo)
        .maybeSingle();

      if (!recentRewardCoupon) {
        const couponCode = `REWARD-${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}`;

        await db.from("coupons").insert({
          code: couponCode,
          discount: COUPON_DISCOUNT_PERCENT,
          type: "percent",
          expires_at: new Date(
            Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          usage_limit: 1,
          user_id: referralUse.referrer_id,
          source: "referral_reward",
        });

        // Send reward notification via Resend
        sendReferralRewardEmail(
          currentProfile.email,
          currentProfile.name,
          couponCode,
          newCoins
        );
      }
    }
  } catch (error) {
    console.error("Error crediting referral coins:", error);
  }
}
