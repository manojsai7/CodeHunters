import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-accent/20 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-accent/10 border-2 border-accent rounded-full">
            <Search className="h-10 w-10 text-accent" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground font-display">404</h1>
          <p className="text-lg font-medium text-foreground">Page not found</p>
          <p className="text-sm text-muted">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg">
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
