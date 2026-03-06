"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Code2, Coins } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    goldCoins?: number;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase not configured
    }
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25 transition-shadow group-hover:shadow-primary/40">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Code<span className="text-primary">Hunters</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/courses"
            className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-white hover:bg-surface"
          >
            Courses
          </Link>
          <Link
            href="/projects"
            className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-white hover:bg-surface"
          >
            Projects
          </Link>
          {user && (
            <Link
              href="/dashboard/my-learning"
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-white hover:bg-surface"
            >
              My Learning
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:text-white hover:bg-surface"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {typeof user.goldCoins === "number" && (
                <Link
                  href="/dashboard/referral"
                  className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
                >
                  <Coins className="h-4 w-4" />
                  {user.goldCoins}
                </Link>
              )}
              <Link href="/dashboard/profile">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/courses"
              className="block rounded-lg px-3 py-2 text-sm text-muted hover:text-white hover:bg-surface"
              onClick={() => setIsOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/projects"
              className="block rounded-lg px-3 py-2 text-sm text-muted hover:text-white hover:bg-surface"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard/my-learning"
                  className="block rounded-lg px-3 py-2 text-sm text-muted hover:text-white hover:bg-surface"
                  onClick={() => setIsOpen(false)}
                >
                  My Learning
                </Link>
                <Link
                  href="/dashboard/referral"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gold hover:bg-surface"
                  onClick={() => setIsOpen(false)}
                >
                  <Coins className="h-4 w-4" />
                  {user.goldCoins} Gold Coins
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block rounded-lg px-3 py-2 text-sm text-muted hover:text-white hover:bg-surface"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="block rounded-lg px-3 py-2 text-sm text-secondary hover:bg-surface"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm text-error hover:bg-surface"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
