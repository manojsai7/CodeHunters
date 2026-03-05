import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return "XXXX XXXXXX";
  return phone.slice(0, 4) + " XXXXXX";
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "HUNTER-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function calculateDiscount(
  originalPrice: number,
  isStudent: boolean,
  referralDiscount: boolean,
  couponDiscount?: number
): { finalPrice: number; totalDiscount: number; discountPercentage: number } {
  let totalDiscountPercent = 0;

  if (isStudent) totalDiscountPercent += 20;
  if (referralDiscount) totalDiscountPercent += 10;
  if (couponDiscount) totalDiscountPercent += couponDiscount;

  // Cap at 30%
  totalDiscountPercent = Math.min(totalDiscountPercent, 30);

  const discountAmount = Math.round(originalPrice * (totalDiscountPercent / 100));
  const finalPrice = originalPrice - discountAmount;

  return {
    finalPrice: Math.max(finalPrice, 0),
    totalDiscount: discountAmount,
    discountPercentage: totalDiscountPercent,
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
