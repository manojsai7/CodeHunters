import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validations";
import { creditReferralCoins } from "@/lib/referral";
import {
  sendPurchaseConfirmationEmail,
  sendPurchaseInvoiceEmail,
} from "@/lib/email";
import { generateInvoiceNumber } from "@/lib/invoice";
import { calculateGST } from "@/lib/gst";
import { safeJsonParse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await safeJsonParse(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
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

      // Send purchase confirmation email via Resend
      if (purchase.profile?.email) {
        const productTitle =
          purchase.course?.title ?? purchase.project?.title ?? "Unknown";
        const productType = purchase.courseId ? "course" : "project";
        const buyerState = purchase.profile.state || "Unknown";
        const amountInRupees = purchase.amount / 100;

        sendPurchaseConfirmationEmail(
          purchase.profile.email,
          purchase.profile.name || "Hunter",
          productTitle,
          purchase.amount,
          razorpay_payment_id
        );

        // Generate invoice, calculate GST, send invoice email
        const invoiceNumber = await generateInvoiceNumber();
        const gstData = calculateGST(amountInRupees, buyerState);
        const invoiceDate = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            invoiceNumber,
            invoiceDate: new Date(),
            gstData: gstData as unknown as Prisma.InputJsonValue,
          },
        });

        sendPurchaseInvoiceEmail(
          purchase.profile.email,
          purchase.profile.name || "Hunter",
          {
            invoiceNumber,
            invoiceDate,
            buyerName: purchase.profile.name || "Hunter",
            buyerEmail: purchase.profile.email,
            buyerState,
            productTitle,
            productType: productType as "course" | "project",
            originalAmount: purchase.originalAmount / 100,
            discountAmount: purchase.discountApplied,
            ...gstData,
            razorpayPaymentId: razorpay_payment_id,
          }
        );

        // Discord admin notification (optional)
        if (process.env.DISCORD_WEBHOOK_URL) {
          fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `💰 New sale! **${purchase.profile.name}** bought **${productTitle}** for ₹${amountInRupees} | Invoice: ${invoiceNumber}`,
            }),
          }).catch((err) =>
            console.error("Discord webhook failed:", err)
          );
        }
      }

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

      // Send purchase confirmation email to guest (look up product title)
      let productTitle = guestPurchase.productType === "course" ? "Course" : "Project";
      if (guestPurchase.productType === "course") {
        const course = await prisma.course.findUnique({ where: { id: guestPurchase.productId }, select: { title: true } });
        if (course) productTitle = course.title;
      } else {
        const project = await prisma.project.findUnique({ where: { id: guestPurchase.productId }, select: { title: true } });
        if (project) productTitle = project.title;
      }
      sendPurchaseConfirmationEmail(
        guestPurchase.email,
        guestPurchase.name,
        productTitle,
        guestPurchase.amount,
        razorpay_payment_id
      );

      // Generate invoice + GST for guest purchase
      const guestAmountInRupees = guestPurchase.amount / 100;
      const guestInvoiceNumber = await generateInvoiceNumber();
      const guestGstData = calculateGST(guestAmountInRupees, guestPurchase.state);
      const guestInvoiceDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      await prisma.guestPurchase.update({
        where: { id: guestPurchase.id },
        data: {
          invoiceNumber: guestInvoiceNumber,
          invoiceDate: new Date(),
          gstData: guestGstData as unknown as Prisma.InputJsonValue,
        },
      });

      sendPurchaseInvoiceEmail(
        guestPurchase.email,
        guestPurchase.name,
        {
          invoiceNumber: guestInvoiceNumber,
          invoiceDate: guestInvoiceDate,
          buyerName: guestPurchase.name,
          buyerEmail: guestPurchase.email,
          buyerState: guestPurchase.state,
          productTitle,
          productType: guestPurchase.productType as "course" | "project",
          originalAmount: guestAmountInRupees,
          discountAmount: guestPurchase.discountApplied,
          ...guestGstData,
          razorpayPaymentId: razorpay_payment_id,
        }
      );

      // Discord admin notification (optional)
      if (process.env.DISCORD_WEBHOOK_URL) {
        fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `💰 New guest sale! **${guestPurchase.name}** bought **${productTitle}** for ₹${guestAmountInRupees} | Invoice: ${guestInvoiceNumber}`,
          }),
        }).catch((err) =>
          console.error("Discord webhook failed:", err)
        );
      }

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
