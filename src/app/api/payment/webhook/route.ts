import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { creditReferralCoins } from "@/lib/referral";
import {
  sendPurchaseConfirmationEmail,
  sendPurchaseInvoiceEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";
import { generateInvoiceNumber } from "@/lib/invoice";
import { calculateGST } from "@/lib/gst";

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

          // Send purchase confirmation + invoice email via Resend
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
              payment.id
            );

            // Generate invoice + GST
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
                razorpayPaymentId: payment.id,
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

          // Send purchase confirmation + invoice email to guest
          let guestProductTitle = guestPurchase.productType === "course" ? "Course" : "Project";
          if (guestPurchase.productType === "course") {
            const course = await prisma.course.findUnique({ where: { id: guestPurchase.productId }, select: { title: true } });
            if (course) guestProductTitle = course.title;
          } else {
            const project = await prisma.project.findUnique({ where: { id: guestPurchase.productId }, select: { title: true } });
            if (project) guestProductTitle = project.title;
          }
          sendPurchaseConfirmationEmail(
            guestPurchase.email,
            guestPurchase.name,
            guestProductTitle,
            guestPurchase.amount,
            payment.id
          );

          // Generate invoice + GST for guest
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
              productTitle: guestProductTitle,
              productType: guestPurchase.productType as "course" | "project",
              originalAmount: guestAmountInRupees,
              discountAmount: guestPurchase.discountApplied,
              ...guestGstData,
              razorpayPaymentId: payment.id,
            }
          );

          // Discord admin notification (optional)
          if (process.env.DISCORD_WEBHOOK_URL) {
            fetch(process.env.DISCORD_WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: `💰 New guest sale! **${guestPurchase.name}** bought **${guestProductTitle}** for ₹${guestAmountInRupees} | Invoice: ${guestInvoiceNumber}`,
              }),
            }).catch((err) =>
              console.error("Discord webhook failed:", err)
            );
          }
        }

        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id as string;
        const failureReason =
          payment.error_description ||
          payment.error_reason ||
          "Payment was declined by your bank";

        await prisma.purchase.updateMany({
          where: { razorpayOrderId: orderId, status: "pending" },
          data: { status: "failed" },
        });

        await prisma.guestPurchase.updateMany({
          where: { razorpayOrderId: orderId, status: "pending" },
          data: { status: "failed" },
        });

        // Look up the failed purchase to send email + log attempt
        const failedPurchase = await prisma.purchase.findUnique({
          where: { razorpayOrderId: orderId },
          include: { profile: true, course: true, project: true },
        });

        if (failedPurchase) {
          const productTitle =
            failedPurchase.course?.title ??
            failedPurchase.project?.title ??
            "Unknown";
          const productType = failedPurchase.courseId ? "course" : "project";
          const productSlug =
            failedPurchase.course?.slug ?? failedPurchase.project?.slug;

          await prisma.paymentAttempt.create({
            data: {
              guestEmail: failedPurchase.profile?.email || "",
              guestName: failedPurchase.profile?.name || "Unknown",
              productId: failedPurchase.courseId || failedPurchase.projectId || "",
              productType,
              amount: failedPurchase.amount,
              razorpayOrderId: orderId,
              failureReason,
            },
          });

          if (failedPurchase.profile?.email && productSlug) {
            const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${productType === "course" ? "courses" : "projects"}/${productSlug}`;
            sendPaymentFailedEmail(
              failedPurchase.profile.email,
              failedPurchase.profile.name || "Hunter",
              productTitle,
              failedPurchase.amount / 100,
              failureReason,
              retryUrl
            );
          }
        }

        // Check guest failed
        const failedGuest = await prisma.guestPurchase.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (failedGuest) {
          let guestFailedProductTitle = failedGuest.productType === "course" ? "Course" : "Project";
          let guestFailedSlug = "";
          if (failedGuest.productType === "course") {
            const course = await prisma.course.findUnique({
              where: { id: failedGuest.productId },
              select: { title: true, slug: true },
            });
            if (course) {
              guestFailedProductTitle = course.title;
              guestFailedSlug = course.slug;
            }
          } else {
            const project = await prisma.project.findUnique({
              where: { id: failedGuest.productId },
              select: { title: true, slug: true },
            });
            if (project) {
              guestFailedProductTitle = project.title;
              guestFailedSlug = project.slug;
            }
          }

          await prisma.paymentAttempt.create({
            data: {
              guestEmail: failedGuest.email,
              guestName: failedGuest.name,
              productId: failedGuest.productId,
              productType: failedGuest.productType,
              amount: failedGuest.amount,
              razorpayOrderId: orderId,
              failureReason,
            },
          });

          if (guestFailedSlug) {
            const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${failedGuest.productType === "course" ? "courses" : "projects"}/${guestFailedSlug}`;
            sendPaymentFailedEmail(
              failedGuest.email,
              failedGuest.name,
              guestFailedProductTitle,
              failedGuest.amount / 100,
              failureReason,
              retryUrl
            );
          }
        }

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
