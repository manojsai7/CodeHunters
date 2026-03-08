import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
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

    const db = createAdminSupabaseClient();

    // Find purchase
    const { data: purchase } = await db
      .from("purchases")
      .select("*, courses(*), projects(*), profiles(*)")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (purchase) {
      if (purchase.status === "completed") {
        return NextResponse.json({
          success: true,
          purchaseId: purchase.id,
          message: "Payment already verified",
        });
      }

      // Atomic check-and-set: only update if still pending (prevents double-completion)
      const { count: updated } = await db
        .from("purchases")
        .update({
          status: "completed",
          razorpay_payment_id: razorpay_payment_id,
        })
        .eq("id", purchase.id)
        .eq("status", "pending");

      // If another request already completed this purchase, exit early
      if ((updated ?? 0) === 0) {
        return NextResponse.json({
          success: true,
          purchaseId: purchase.id,
          message: "Payment already verified",
        });
      }

      // Increment purchasesCount on course or project
      if (purchase.course_id) {
        const { error: rpcError } = await db.rpc("increment_field", {
          table_name: "courses",
          row_id: purchase.course_id,
          field_name: "purchases_count",
        });
        if (rpcError) {
          // Fallback: manual increment
          const { data: c } = await db.from("courses").select("purchases_count").eq("id", purchase.course_id).single();
          if (c) await db.from("courses").update({ purchases_count: (c.purchases_count ?? 0) + 1 }).eq("id", purchase.course_id);
        }
      } else if (purchase.project_id) {
        const { data: p } = await db.from("projects").select("purchases_count").eq("id", purchase.project_id).single();
        if (p) await db.from("projects").update({ purchases_count: (p.purchases_count ?? 0) + 1 }).eq("id", purchase.project_id);
      }

      // Credit referral coins if user was referred
      if (purchase.user_id) {
        const { data: profile } = await db
          .from("profiles")
          .select("user_id")
          .eq("user_id", purchase.user_id)
          .single();
        if (profile) {
          await creditReferralCoins(purchase.user_id);
        }
      }

      // Increment coupon usage
      if (purchase.coupon_code) {
        const { data: coupon } = await db.from("coupons").select("used_count").eq("code", purchase.coupon_code).single();
        if (coupon) {
          await db.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("code", purchase.coupon_code);
        }
      }

      // Send purchase confirmation email via Resend
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
            razorpayPaymentId: razorpay_payment_id,
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

      return NextResponse.json({
        success: true,
        purchaseId: purchase.id,
      });
    }

    // Check guest purchases
    const { data: guestPurchase } = await db
      .from("guest_purchases")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (guestPurchase) {
      if (guestPurchase.status === "completed") {
        return NextResponse.json({
          success: true,
          purchaseId: guestPurchase.id,
          message: "Payment already verified",
        });
      }

      // Atomic check-and-set: only update if still pending
      const { count: guestUpdated } = await db
        .from("guest_purchases")
        .update({
          status: "completed",
          razorpay_payment_id: razorpay_payment_id,
        })
        .eq("id", guestPurchase.id)
        .eq("status", "pending");

      if ((guestUpdated ?? 0) === 0) {
        return NextResponse.json({
          success: true,
          purchaseId: guestPurchase.id,
          message: "Payment already verified",
        });
      }

      // Increment purchasesCount
      const countTable = guestPurchase.product_type === "course" ? "courses" : "projects";
      const { data: prod } = await db.from(countTable).select("purchases_count").eq("id", guestPurchase.product_id).single();
      if (prod) {
        await db.from(countTable).update({ purchases_count: (prod.purchases_count ?? 0) + 1 }).eq("id", guestPurchase.product_id);
      }

      // Send purchase confirmation email to guest (look up product title)
      let productTitle = guestPurchase.product_type === "course" ? "Course" : "Project";
      const prodTable = guestPurchase.product_type === "course" ? "courses" : "projects";
      const { data: prodData } = await db.from(prodTable).select("title").eq("id", guestPurchase.product_id).single();
      if (prodData) productTitle = prodData.title;

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
          productTitle,
          productType: guestPurchase.product_type as "course" | "project",
          originalAmount: guestAmountInRupees,
          discountAmount: guestPurchase.discount_applied,
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
