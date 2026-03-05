"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FolderDown,
  Gift,
  User,
  Coins,
  Shield,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  profile: {
    name: string;
    email: string;
    role: string;
    goldCoins: number;
    avatarUrl: string | null;
  };
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-learning", label: "My Learning", icon: BookOpen },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderDown },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardSidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Profile summary */}
      <div className="border-b border-border/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              profile.name?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {profile.name}
            </p>
            <p className="truncate text-xs text-muted">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Gold coins */}
      <div className="border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2.5 rounded-lg bg-gold/10 px-3 py-2.5 border border-gold/20">
          <Coins className="h-5 w-5 text-gold" />
          <div>
            <p className="text-xs text-gold/80">Gold Coins</p>
            <p className="text-lg font-bold text-gold">{profile.goldCoins}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted hover:bg-surface-hover hover:text-white border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted group-hover:text-white"
                )}
              />
              {item.label}
              {active && (
                <ChevronRight className="ml-auto h-4 w-4 text-primary/60" />
              )}
            </Link>
          );
        })}

        {profile.role === "admin" && (
          <>
            <div className="my-3 border-t border-border/30" />
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-secondary/10 border border-transparent hover:border-secondary/20 transition-all duration-200"
            >
              <Shield className="h-4.5 w-4.5 shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-[4.5rem] z-40 rounded-lg border border-border bg-surface p-2 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] border-r border-border/50 bg-surface/95 backdrop-blur-xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                <span className="text-sm font-bold text-white">Dashboard</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1 text-muted hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-16 lg:z-30 lg:flex lg:h-[calc(100vh-4rem)] lg:w-[260px] lg:flex-col lg:border-r lg:border-border/50 lg:bg-surface/50 lg:backdrop-blur-xl">
        {sidebarContent}
      </aside>
    </>
  );
}
