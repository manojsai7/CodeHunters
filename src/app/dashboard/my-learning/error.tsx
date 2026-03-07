"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MyLearningError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[my-learning/error.tsx]", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">My Learning</h1>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <BookOpen className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-white">Couldn&apos;t load your courses</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p className="mt-1 text-xs font-mono text-muted/60">ID: {error.digest}</p>
          )}
          <div className="mt-5 flex gap-3">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/courses">
              <Button variant="outline">Browse Courses</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
