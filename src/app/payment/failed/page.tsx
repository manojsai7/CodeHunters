import { Metadata } from "next";
import Link from "next/link";
import { XCircle, RefreshCw, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment Failed | Code Hunters",
};

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Animation */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-red-500/10 border-2 border-red-500 rounded-full">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Payment Failed</h1>
          <p className="text-muted">
            We couldn&apos;t process your payment. Don&apos;t worry, no amount has been deducted from your account.
          </p>
        </div>

        <div className="bg-surface/30 border border-white/10 rounded-xl p-6 text-left space-y-3">
          <h3 className="text-white font-medium">Common reasons:</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              Insufficient balance in your account
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              Transaction declined by your bank
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              Network timeout or connectivity issue
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              Payment session expired
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="javascript:history.back()" className="block">
            <Button className="w-full" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Link>

          <a href="mailto:support@codehunters.in" className="block">
            <Button variant="outline" className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </a>

          <Link href="/" className="block">
            <Button variant="ghost" className="w-full text-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted">
          If money was deducted, it will be refunded within 5-7 business days.
        </p>
      </div>
    </div>
  );
}
