import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Payment Successful | Code Hunters",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  let purchase = null;

  if (orderId) {
    purchase = await prisma.purchase.findFirst({
      where: { razorpayOrderId: orderId, status: "completed" },
      include: {
        course: { select: { title: true, slug: true } },
        project: { select: { title: true, slug: true, zipUrl: true } },
      },
    });

    if (!purchase) {
      // Check guest purchases
      const guestPurchase = await prisma.guestPurchase.findFirst({
        where: { razorpayOrderId: orderId, status: "completed" },
      });
      if (guestPurchase) {
        // Fetch project separately
        const project = await prisma.project.findUnique({
          where: { id: guestPurchase.productId },
          select: { title: true, slug: true, zipUrl: true },
        });
        purchase = {
          ...guestPurchase,
          course: null,
          project: guestPurchase.productType === "project" ? project : null,
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

          {purchase?.project?.zipUrl && (
            <a href={purchase.project.zipUrl} target="_blank" rel="noopener noreferrer" className="block">
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
