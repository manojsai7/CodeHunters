import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
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
    const db = createAdminSupabaseClient();

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id as string;

        // Handle in Purchase table
        const { data: purchase } = await db
          .from("purchases")
          .select("*, profiles(*), courses(*), projects(*)")
          .eq("razorpay_order_id", orderId)
          .maybeSingle();

        if (purchase && purchase.status !== "completed") {
          // Atomic check-and-set: only complete if still pending
          const { count: updated } = await db
            .from("purchases")
            .update({
              status: "completed",
              razorpay_payment_id: payment.id,
            })
            .eq("id", purchase.id)
            .eq("status", "pending");

         if ((updated ?? 0) > 0) {
          // Increment purchasesCount
          if (purchase.course_id) {
            const { data: c } = await db.from("courses").select("purchases_count").eq("id", purchase.course_id).single();
            if (c) await db.from("courses").update({ purchases_count: (c.purchases_count ?? 0) + 1 }).eq("id", purchase.course_id);
          } else if (purchase.project_id) {
            const { data: p } = await db.from("projects").select("purchases_count").eq("id", purchase.project_id).single();
            if (p) await db.from("projects").update({ purchases_count: (p.purchases_count ?? 0) + 1 }).eq("id", purchase.project_id);
          }

          // Credit referral coins
          if (purchase.user_id) {
            await creditReferralCoins(purchase.user_id);
          }

          // Increment coupon usage
          if (purchase.coupon_code) {
            const { data: coupon } = await db.from("coupons").select("used_count").eq("code", purchase.coupon_code).single();
            if (coupon) {
              await db.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("code", purchase.coupon_code);
            }
          }

          // Send purchase confirmation + invoice email via Resend
          const profileData = purchase.profiles;
          if (profileData?.email) {
            const productTitle =
              purchase.courses?.title ?? purchase.projects?.title ?? "Unknown";
            const productType = purchase.course_id ? "course" : "project";
            const buyerState = profileData.state || "Unknown";
            const amountInRupees = purchase.amount / 100;

            sendPurchaseConfirmationEmail(
              profileData.email,
              profileData.name || "Hunter",
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

            await db
              .from("purchases")
              .update({
                invoice_number: invoiceNumber,
                invoice_date: new Date().toISOString(),
                gst_data: gstData,
              })
              .eq("id", purchase.id);

            sendPurchaseInvoiceEmail(
              profileData.email,
              profileData.name || "Hunter",
              {
                invoiceNumber,
                invoiceDate,
                buyerName: profileData.name || "Hunter",
                buyerEmail: profileData.email,
                buyerState,
                productTitle,
                productType: productType as "course" | "project",
                originalAmount: purchase.original_amount / 100,
                discountAmount: purchase.discount_applied,
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
                  content: `💰 New sale! **${profileData.name}** bought **${productTitle}** for ₹${amountInRupees} | Invoice: ${invoiceNumber}`,
                }),
              }).catch((err) =>
                console.error("Discord webhook failed:", err)
              );
            }
          }
         } // end if (updated > 0)
        }

        // Also check guest purchases
        const { data: guestPurchase } = await db
          .from("guest_purchases")
          .select("*")
          .eq("razorpay_order_id", orderId)
          .maybeSingle();

        if (guestPurchase && guestPurchase.status !== "completed") {
          // Atomic check-and-set for guest purchases
          const { count: guestUpdated } = await db
            .from("guest_purchases")
            .update({
              status: "completed",
              razorpay_payment_id: payment.id,
            })
            .eq("id", guestPurchase.id)
            .eq("status", "pending");

         if ((guestUpdated ?? 0) > 0) {
          const countTable = guestPurchase.product_type === "course" ? "courses" : "projects";
          const { data: prod } = await db.from(countTable).select("purchases_count").eq("id", guestPurchase.product_id).single();
          if (prod) {
            await db.from(countTable).update({ purchases_count: (prod.purchases_count ?? 0) + 1 }).eq("id", guestPurchase.product_id);
          }

          // Send purchase confirmation + invoice email to guest
          let guestProductTitle = guestPurchase.product_type === "course" ? "Course" : "Project";
          const prodTable = guestPurchase.product_type === "course" ? "courses" : "projects";
          const { data: prodData } = await db.from(prodTable).select("title").eq("id", guestPurchase.product_id).single();
          if (prodData) guestProductTitle = prodData.title;

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

          await db
            .from("guest_purchases")
            .update({
              invoice_number: guestInvoiceNumber,
              invoice_date: new Date().toISOString(),
              gst_data: guestGstData,
            })
            .eq("id", guestPurchase.id);

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
              productType: guestPurchase.product_type as "course" | "project",
              originalAmount: guestAmountInRupees,
              discountAmount: guestPurchase.discount_applied,
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
         } // end if (guestUpdated > 0)
        } // end if (guestPurchase && status !== "completed")

        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id as string;
        const failureReason =
          payment.error_description ||
          payment.error_reason ||
          "Payment was declined by your bank";

        await db
          .from("purchases")
          .update({ status: "failed" })
          .eq("razorpay_order_id", orderId)
          .eq("status", "pending");

        await db
          .from("guest_purchases")
          .update({ status: "failed" })
          .eq("razorpay_order_id", orderId)
          .eq("status", "pending");

        // Look up the failed purchase to send email + log attempt
        const { data: failedPurchase } = await db
          .from("purchases")
          .select("*, profiles(*), courses(*), projects(*)")
          .eq("razorpay_order_id", orderId)
          .maybeSingle();

        if (failedPurchase) {
          const productTitle =
            failedPurchase.courses?.title ??
            failedPurchase.projects?.title ??
            "Unknown";
          const productType = failedPurchase.course_id ? "course" : "project";
          const productSlug =
            failedPurchase.courses?.slug ?? failedPurchase.projects?.slug;

          await db.from("payment_attempts").insert({
            guest_email: failedPurchase.profiles?.email || "",
            guest_name: failedPurchase.profiles?.name || "Unknown",
            product_id: failedPurchase.course_id || failedPurchase.project_id || "",
            product_type: productType,
            amount: failedPurchase.amount,
            razorpay_order_id: orderId,
            failure_reason: failureReason,
          });

          if (failedPurchase.profiles?.email && productSlug) {
            const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${productType === "course" ? "courses" : "projects"}/${productSlug}`;
            sendPaymentFailedEmail(
              failedPurchase.profiles.email,
              failedPurchase.profiles.name || "Hunter",
              productTitle,
              failedPurchase.amount / 100,
              failureReason,
              retryUrl
            );
          }
        }

        // Check guest failed
        const { data: failedGuest } = await db
          .from("guest_purchases")
          .select("*")
          .eq("razorpay_order_id", orderId)
          .maybeSingle();

        if (failedGuest) {
          let guestFailedProductTitle = failedGuest.product_type === "course" ? "Course" : "Project";
          let guestFailedSlug = "";
          const failedProdTable = failedGuest.product_type === "course" ? "courses" : "projects";
          const { data: failedProd } = await db.from(failedProdTable).select("title, slug").eq("id", failedGuest.product_id).single();
          if (failedProd) {
            guestFailedProductTitle = failedProd.title;
            guestFailedSlug = failedProd.slug;
          }

          await db.from("payment_attempts").insert({
            guest_email: failedGuest.email,
            guest_name: failedGuest.name,
            product_id: failedGuest.product_id,
            product_type: failedGuest.product_type,
            amount: failedGuest.amount,
            razorpay_order_id: orderId,
            failure_reason: failureReason,
          });

          if (guestFailedSlug) {
            const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${failedGuest.product_type === "course" ? "courses" : "projects"}/${guestFailedSlug}`;
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
          await db
            .from("purchases")
            .update({ status: "refunded" })
            .eq("razorpay_payment_id", paymentId);

          await db
            .from("guest_purchases")
            .update({ status: "refunded" })
            .eq("razorpay_payment_id", paymentId);
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
