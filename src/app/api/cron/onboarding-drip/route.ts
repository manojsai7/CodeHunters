import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import prisma from "@/lib/prisma";
import { sendOnboardingDay3Email, sendOnboardingDay7Email } from "@/lib/email";

async function handler() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Day 3 emails — profiles created 3+ days ago without a "day3" EmailLog
  const day3Profiles = await prisma.profile.findMany({
    where: {
      createdAt: { lte: threeDaysAgo },
      emailLogs: { none: { emailType: "day3" } },
    },
    select: { userId: true, email: true, name: true },
    take: 100,
  });

  // Day 7 emails — profiles created 7+ days ago without a "day7" EmailLog
  const day7Profiles = await prisma.profile.findMany({
    where: {
      createdAt: { lte: sevenDaysAgo },
      emailLogs: { none: { emailType: "day7" } },
    },
    select: { userId: true, email: true, name: true },
    take: 100,
  });

  const results = { day3Sent: 0, day7Sent: 0, errors: 0 };

  // Send Day 3 emails
  const day3Promises = day3Profiles.map(async (profile) => {
    try {
      await sendOnboardingDay3Email(profile.email, profile.name);
      await prisma.emailLog.create({
        data: { userId: profile.userId, emailType: "day3" },
      });
      results.day3Sent++;
    } catch (err) {
      console.error(`Day 3 email failed for ${profile.email}:`, err);
      results.errors++;
    }
  });

  // Send Day 7 emails
  const day7Promises = day7Profiles.map(async (profile) => {
    try {
      await sendOnboardingDay7Email(profile.email, profile.name);
      await prisma.emailLog.create({
        data: { userId: profile.userId, emailType: "day7" },
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

export const POST = verifySignatureAppRouter(handler);
