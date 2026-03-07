import { Client } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export { qstash };

export async function registerCronJobs() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");

  // Drip emails — daily 9AM IST (3:30 AM UTC)
  await qstash.schedules.create({
    destination: `${appUrl}/api/cron/onboarding-drip`,
    cron: "30 3 * * *",
  });
}
