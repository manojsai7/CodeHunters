import prisma from "@/lib/prisma";

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.purchase.count({
    where: { invoiceNumber: { not: null } },
  });
  const seq = String(count + 1).padStart(5, "0");
  return `INV-${year}-${seq}`;
}
