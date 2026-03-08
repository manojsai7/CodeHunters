import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment Successful | Code Hunters",
};

export default async function PaymentSuccessPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const orderId = searchParams.orderId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let purchase: any = null;

  if (orderId) {
    const db = createAdminSupabaseClient();

    const { data: dbPurchase } = await db
      .from("purchases")
      .select("*, courses(title, slug), projects(title, slug, zip_url)")
      .eq("razorpay_order_id", orderId)
      .eq("status", "completed")
      .maybeSingle();

    if (dbPurchase) {
      purchase = {
        ...dbPurchase,
        course: dbPurchase.courses,
        project: dbPurchase.projects,
      };
    } else {
      // Check guest purchases
      const { data: guestPurchase } = await db
        .from("guest_purchases")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .eq("status", "completed")
        .maybeSingle();

      if (guestPurchase) {
        let project = null;
        if (guestPurchase.product_type === "project") {
          const { data: p } = await db
            .from("projects")
            .select("title, slug, zip_url")
            .eq("id", guestPurchase.product_id)
            .single();
          project = p;
        }
        purchase = {
          ...guestPurchase,
          course: null,
          project,
        };
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Animation */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-green-500/10 border-2 border-green-500 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
          <p className="text-muted">
            Your payment has been processed successfully. Thank you for your purchase!
          </p>
        </div>

        {purchase && (
          <div className="bg-surface/30 border border-white/10 rounded-xl p-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-muted">Item</span>
              <span className="text-white font-medium">
                {purchase.course?.title || purchase.project?.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Amount Paid</span>
              <span className="text-primary font-bold">
                {formatPrice(purchase.amount)}
              </span>
            </div>
            {orderId && (
              <div className="flex justify-between">
                <span className="text-muted">Order ID</span>
                <span className="text-white text-sm font-mono">{orderId}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {purchase?.course && (
            <Link href={`/dashboard/my-learning/${purchase.course.slug}`} className="block">
              <Button className="w-full" size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}

          {purchase?.project?.zip_url && (
            <a href={purchase.project.zip_url as string} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download Project
              </Button>
            </a>
          )}

          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button variant="ghost" className="w-full text-muted">
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
