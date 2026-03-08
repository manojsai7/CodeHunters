import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendOnboardingDay3Email, sendOnboardingDay7Email } from "@/lib/email";

async function verifyQStashSignature(request: NextRequest): Promise<boolean> {
  const signature = request.headers.get("upstash-signature");
  if (!signature) return false;

  try {
    const receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    });
    const body = await request.clone().text();
    return await receiver.verify({ signature, body });
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const isValid = await verifyQStashSignature(request);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const db = createAdminSupabaseClient();

  // Get all email logs to filter out already sent
  const { data: emailLogs } = await db
    .from("email_logs")
    .select("user_id, email_type");

  const day3Sent = new Set<string>();
  const day7Sent = new Set<string>();
  for (const log of emailLogs ?? []) {
    if (log.email_type === "day3") day3Sent.add(log.user_id);
    if (log.email_type === "day7") day7Sent.add(log.user_id);
  }

  // Day 3 profiles — created 3+ days ago, no day3 email sent
  const { data: day3Candidates } = await db
    .from("profiles")
    .select("user_id, email, name")
    .lte("created_at", threeDaysAgo)
    .limit(100);

  const day3Profiles = (day3Candidates ?? []).filter((p: { user_id: string }) => !day3Sent.has(p.user_id));

  // Day 7 profiles — created 7+ days ago, no day7 email sent
  const { data: day7Candidates } = await db
    .from("profiles")
    .select("user_id, email, name")
    .lte("created_at", sevenDaysAgo)
    .limit(100);

  const day7Profiles = (day7Candidates ?? []).filter((p: { user_id: string }) => !day7Sent.has(p.user_id));

  const results = { day3Sent: 0, day7Sent: 0, errors: 0 };

  // Send Day 3 emails
  const day3Promises = day3Profiles.map(async (profile: { user_id: string; email: string; name: string }) => {
    try {
      await sendOnboardingDay3Email(profile.email, profile.name);
      await db.from("email_logs").insert({
        user_id: profile.user_id,
        email_type: "day3",
      });
      results.day3Sent++;
    } catch (err) {
      console.error(`Day 3 email failed for ${profile.email}:`, err);
      results.errors++;
    }
  });

  // Send Day 7 emails
  const day7Promises = day7Profiles.map(async (profile: { user_id: string; email: string; name: string }) => {
    try {
      await sendOnboardingDay7Email(profile.email, profile.name);
      await db.from("email_logs").insert({
        user_id: profile.user_id,
        email_type: "day7",
      });
      results.day7Sent++;
    } catch (err) {
      console.error(`Day 7 email failed for ${profile.email}:`, err);
      results.errors++;
    }
  });

  await Promise.allSettled([...day3Promises, ...day7Promises]);

  return NextResponse.json({
    ok: true,
    ...results,
    timestamp: now.toISOString(),
  });
}
