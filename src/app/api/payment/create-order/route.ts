import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { getRazorpay } from "@/lib/razorpay";
import { createOrderSchema } from "@/lib/validations";
import { classifyEmail, isBlockedEmail } from "@/utils/emailTrust";
import { safeJsonParse } from "@/lib/utils";
import {
  STUDENT_DISCOUNT_PERCENT,
  MAX_TOTAL_DISCOUNT_PERCENT,
} from "@/utils/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await safeJsonParse(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      state,
      selfDeclaredStudent,
      productId,
      productType,
      couponCode,
      referralCode,
    } = parsed.data;

    // Block temporary/disposable emails
    if (isBlockedEmail(email)) {
      return NextResponse.json(
        { error: "Temporary or disposable emails are not allowed" },
        { status: 400 }
      );
    }

    // Save pre-checkout lead for remarketing
    await prisma.preCheckoutLead.create({
      data: {
        name,
        email,
        phone,
        state,
        selfDeclaredStudent,
        productId,
        productType,
      },
    });

    // Fetch the product
    let product: { id: string; price: number; mrp: number; title: string } | null = null;

    if (productType === "course") {
      product = await prisma.course.findUnique({
        where: { id: productId },
        select: { id: true, price: true, mrp: true, title: true },
      });
    } else {
      product = await prisma.project.findUnique({
        where: { id: productId },
        select: { id: true, price: true, mrp: true, title: true },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: `${productType === "course" ? "Course" : "Project"} not found` },
        { status: 404 }
      );
    }

    // Price calculation
    const originalAmount = product.price; // sale price in INR
    let totalDiscountPercent = 0;

    // Student discount
    let isStudentDiscount = false;
    if (selfDeclaredStudent && classifyEmail(email) === "student") {
      totalDiscountPercent += STUDENT_DISCOUNT_PERCENT;
      isStudentDiscount = true;
    }

    // Coupon discount
    let validCoupon: { id: string; discount: number; code: string; type: string } | null = null;
    let flatDiscountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (
        coupon &&
        coupon.isActive &&
        coupon.usedCount < coupon.usageLimit &&
        new Date() < coupon.expiresAt
      ) {
        validCoupon = coupon;
        if (coupon.type === "flat") {
          flatDiscountAmount = coupon.discount;
        } else {
          totalDiscountPercent += coupon.discount;
        }
      }
    }

    // Cap total percent discount
    totalDiscountPercent = Math.min(totalDiscountPercent, MAX_TOTAL_DISCOUNT_PERCENT);

    const percentDiscountAmount = Math.round(originalAmount * (totalDiscountPercent / 100));
    const discountAmount = Math.min(percentDiscountAmount + flatDiscountAmount, originalAmount);
    const finalAmount = Math.max(originalAmount - discountAmount, 0);
    const amountInPaise = Math.round(finalAmount * 100);

    // Get authenticated user if available
    let userId: string | null = null;
    try {
      const user = await getUser();
      userId = user?.id ?? null;
    } catch {
      // Guest checkout
    }

    // Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        productId,
        productType,
        userId: userId ?? "guest",
        email,
      },
    });

    // Create purchase record
    if (userId) {
      await prisma.purchase.create({
        data: {
          userId,
          ...(productType === "course" ? { courseId: productId } : { projectId: productId }),
          amount: amountInPaise,
          originalAmount: Math.round(originalAmount * 100),
          discountApplied: totalDiscountPercent,
          isStudentDiscount,
          couponCode: validCoupon?.code ?? null,
          razorpayOrderId: razorpayOrder.id,
          status: "pending",
        },
      });
    } else {
      await prisma.guestPurchase.create({
        data: {
          name,
          email,
          phone,
          state,
          selfDeclaredStudent,
          emailTrustLevel: classifyEmail(email),
          productId,
          productType,
          amount: amountInPaise,
          discountApplied: totalDiscountPercent,
          razorpayOrderId: razorpayOrder.id,
          referralCodeUsed: referralCode ?? null,
          status: "pending",
        },
      });
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
