import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { safeJsonParse } from "@/lib/utils";

const validateCouponSchema = z.object({
  code: z.string().min(1),
  productId: z.string().optional(),
  productType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await safeJsonParse(request);
    if (!body) {
      return NextResponse.json({ valid: false, message: "Invalid request" }, { status: 400 });
    }
    const parsed = validateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const { code } = parsed.data;

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Coupon not found",
      });
    }

    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        message: "This coupon is no longer active",
      });
    }

    if (new Date() > coupon.expiresAt) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has expired",
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has reached its usage limit",
      });
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount,
      type: coupon.type,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
