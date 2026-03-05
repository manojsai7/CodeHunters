"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface p-6",
        "backdrop-blur-sm bg-surface/80",
        "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      {/* Glass highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-error" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  change >= 0 ? "text-success" : "text-error"
                )}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-muted">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
