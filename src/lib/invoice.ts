import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.purchase.count({
    where: { invoiceNumber: { not: null } },
  });
  const guestCount = await prisma.guestPurchase.count({
    where: { invoiceNumber: { not: null } },
  });
  const total = count + guestCount;
  // Add a random suffix to avoid collisions from concurrent calls
  const rand = crypto.randomBytes(2).toString("hex");
  const seq = String(total + 1).padStart(5, "0");
  return `INV-${year}-${seq}-${rand}`;
}
