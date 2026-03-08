import { createAdminSupabaseClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function generateInvoiceNumber(): Promise<string> {
  const db = createAdminSupabaseClient();
  const year = new Date().getFullYear();

  const [{ count: pCount }, { count: gCount }] = await Promise.all([
    db
      .from("purchases")
      .select("*", { count: "exact", head: true })
      .not("invoice_number", "is", null),
    db
      .from("guest_purchases")
      .select("*", { count: "exact", head: true })
      .not("invoice_number", "is", null),
  ]);

  const total = (pCount ?? 0) + (gCount ?? 0);
  // Add a random suffix to avoid collisions from concurrent calls
  const rand = crypto.randomBytes(2).toString("hex");
  const seq = String(total + 1).padStart(5, "0");
  return `INV-${year}-${seq}-${rand}`;
}
