import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getUser } from "@/lib/supabase/server";
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

    const db = createAdminSupabaseClient();

    // Save pre-checkout lead for remarketing
    await db.from("pre_checkout_leads").insert({
      name,
      email,
      phone,
      state,
      self_declared_student: selfDeclaredStudent,
      product_id: productId,
      product_type: productType,
    });

    // Fetch the product
    const table = productType === "course" ? "courses" : "projects";
    const { data: product } = await db
      .from(table)
      .select("id, price, mrp, title")
      .eq("id", productId)
      .single();

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
      const { data: coupon } = await db
        .from("coupons")
        .select("id, discount, code, type, is_active, used_count, usage_limit, expires_at")
        .eq("code", couponCode)
        .single();

      if (
        coupon &&
        coupon.is_active &&
        coupon.used_count < coupon.usage_limit &&
        new Date() < new Date(coupon.expires_at)
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
      await db.from("purchases").insert({
        user_id: userId,
        ...(productType === "course" ? { course_id: productId } : { project_id: productId }),
        amount: amountInPaise,
        original_amount: Math.round(originalAmount * 100),
        discount_applied: totalDiscountPercent,
        is_student_discount: isStudentDiscount,
        coupon_code: validCoupon?.code ?? null,
        razorpay_order_id: razorpayOrder.id,
        status: "pending",
      });
    } else {
      await db.from("guest_purchases").insert({
        name,
        email,
        phone,
        state,
        self_declared_student: selfDeclaredStudent,
        email_trust_level: classifyEmail(email),
        product_id: productId,
        product_type: productType,
        amount: amountInPaise,
        discount_applied: totalDiscountPercent,
        razorpay_order_id: razorpayOrder.id,
        referral_code_used: referralCode ?? null,
        status: "pending",
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
