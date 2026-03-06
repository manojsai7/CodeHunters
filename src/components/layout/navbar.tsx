"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Coins } from "lucide-react";
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
    <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Code Hunters"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-xl font-bold font-display tracking-tight text-white">
            Code Hunters
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/courses"
            className="text-sm text-muted transition-colors hover:text-white"
          >
            Courses
          </Link>
          <Link
            href="/projects"
            className="text-sm text-muted transition-colors hover:text-white"
          >
            Projects
          </Link>
          {user && (
            <Link
              href="/dashboard/my-learning"
              className="text-sm text-muted transition-colors hover:text-white"
            >
              My Learning
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-sm text-accent transition-colors hover:text-accent-hover"
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
                  className="flex items-center gap-1.5 rounded-full border border-border-light px-3 py-1.5 text-sm text-muted hover:text-white transition-colors"
                >
                  <Coins className="h-3.5 w-3.5" />
                  {user.goldCoins}
                </Link>
              )}
              <Link href="/dashboard/profile">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
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
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden border-t border-border bg-black/95 backdrop-blur-md md:hidden"
        >
          <div className="space-y-1 px-5 pb-5 pt-3">
            <Link
              href="/courses"
              className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/projects"
              className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard/my-learning"
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  My Learning
                </Link>
                <Link
                  href="/dashboard/referral"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <Coins className="h-3.5 w-3.5" />
                  {user.goldCoins} Coins
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="block rounded-lg px-3 py-2.5 text-sm text-accent"
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
                  className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-error"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-3">
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
