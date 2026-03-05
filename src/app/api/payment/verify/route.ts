import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validations";
import { creditReferralCoins, triggerN8nWebhook } from "@/lib/referral";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parsed.data;

    // Verify Razorpay signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find and update purchase
    const purchase = await prisma.purchase.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { course: true, project: true, profile: true },
    });

    if (purchase) {
      if (purchase.status === "completed") {
        return NextResponse.json({
          success: true,
          purchaseId: purchase.id,
          message: "Payment already verified",
        });
      }

      // Update purchase to completed
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "completed",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      // Increment purchasesCount on course or project
      if (purchase.courseId) {
        await prisma.course.update({
          where: { id: purchase.courseId },
          data: { purchasesCount: { increment: 1 } },
        });
      } else if (purchase.projectId) {
        await prisma.project.update({
          where: { id: purchase.projectId },
          data: { purchasesCount: { increment: 1 } },
        });
      }

      // Credit referral coins if user was referred
      if (purchase.userId) {
        const profile = await prisma.profile.findUnique({
          where: { userId: purchase.userId },
        });
        if (profile) {
          await creditReferralCoins(purchase.userId);
        }
      }

      // Increment coupon usage
      if (purchase.couponCode) {
        await prisma.coupon.update({
          where: { code: purchase.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Trigger n8n webhook
      await triggerN8nWebhook("enrollment", {
        purchaseId: purchase.id,
        userId: purchase.userId,
        email: purchase.profile?.email,
        name: purchase.profile?.name,
        productType: purchase.courseId ? "course" : "project",
        productId: purchase.courseId ?? purchase.projectId,
        productTitle:
          purchase.course?.title ?? purchase.project?.title ?? "Unknown",
        amount: purchase.amount,
      });

      return NextResponse.json({
        success: true,
        purchaseId: purchase.id,
      });
    }

    // Check guest purchases
    const guestPurchase = await prisma.guestPurchase.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (guestPurchase) {
      if (guestPurchase.status === "completed") {
        return NextResponse.json({
          success: true,
          purchaseId: guestPurchase.id,
          message: "Payment already verified",
        });
      }

      await prisma.guestPurchase.update({
        where: { id: guestPurchase.id },
        data: {
          status: "completed",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      // Increment purchasesCount
      if (guestPurchase.productType === "course") {
        await prisma.course.update({
          where: { id: guestPurchase.productId },
          data: { purchasesCount: { increment: 1 } },
        });
      } else {
        await prisma.project.update({
          where: { id: guestPurchase.productId },
          data: { purchasesCount: { increment: 1 } },
        });
      }

      await triggerN8nWebhook("enrollment", {
        purchaseId: guestPurchase.id,
        email: guestPurchase.email,
        name: guestPurchase.name,
        productType: guestPurchase.productType,
        productId: guestPurchase.productId,
        amount: guestPurchase.amount,
        isGuest: true,
      });

      return NextResponse.json({
        success: true,
        purchaseId: guestPurchase.id,
      });
    }

    return NextResponse.json(
      { error: "Purchase not found for this order" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
