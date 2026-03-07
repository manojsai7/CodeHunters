"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-yellow-500/10 border-2 border-yellow-500 rounded-full">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted">
            An unexpected error occurred. Please try again or return to the homepage.
          </p>
        </div>

        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-muted">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
