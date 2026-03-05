import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { creditReferralCoins, triggerN8nWebhook } from "@/lib/referral";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const payload = event.payload;

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id as string;

        // Handle in Purchase table
        const purchase = await prisma.purchase.findUnique({
          where: { razorpayOrderId: orderId },
          include: { profile: true, course: true, project: true },
        });

        if (purchase && purchase.status !== "completed") {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: "completed",
              razorpayPaymentId: payment.id,
            },
          });

          // Increment purchasesCount
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

          // Credit referral coins
          if (purchase.userId) {
            await creditReferralCoins(purchase.userId);
          }

          // Increment coupon usage
          if (purchase.couponCode) {
            await prisma.coupon.update({
              where: { code: purchase.couponCode },
              data: { usedCount: { increment: 1 } },
            });
          }

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
            source: "webhook",
          });
        }

        // Also check guest purchases
        const guestPurchase = await prisma.guestPurchase.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (guestPurchase && guestPurchase.status !== "completed") {
          await prisma.guestPurchase.update({
            where: { id: guestPurchase.id },
            data: {
              status: "completed",
              razorpayPaymentId: payment.id,
            },
          });

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
            source: "webhook",
          });
        }

        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id as string;

        await prisma.purchase.updateMany({
          where: { razorpayOrderId: orderId, status: "pending" },
          data: { status: "failed" },
        });

        await prisma.guestPurchase.updateMany({
          where: { razorpayOrderId: orderId, status: "pending" },
          data: { status: "failed" },
        });

        break;
      }

      case "refund.processed": {
        const refund = payload.refund?.entity;
        const paymentId = refund?.payment_id as string;

        if (paymentId) {
          await prisma.purchase.updateMany({
            where: { razorpayPaymentId: paymentId },
            data: { status: "refunded" },
          });

          await prisma.guestPurchase.updateMany({
            where: { razorpayPaymentId: paymentId },
            data: { status: "refunded" },
          });
        }

        break;
      }

      default:
        console.log(`Unhandled Razorpay webhook event: ${eventType}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
