"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Tag, TrendingDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import type { PriceBreakdownData } from "@/hooks/use-checkout";

interface PriceBreakdownProps {
  breakdown: PriceBreakdownData;
  goldCoins?: number;
  className?: string;
}

function AnimatedAmount({ amount, prefix = "" }: { amount: number; prefix?: string }) {
  return (
    <motion.span
      key={amount}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      {prefix}
      {formatPrice(amount)}
    </motion.span>
  );
}

export function PriceBreakdown({ breakdown, goldCoins, className }: PriceBreakdownProps) {
  const {
    originalPrice,
    saleDiscount,
    studentDiscount,
    couponDiscount,
    totalDiscount,
    finalPrice,
    savingsPercent,
  } = breakdown;

  const saleDiscountPercent = useMemo(
    () =>
      originalPrice > 0
        ? Math.round((saleDiscount / originalPrice) * 100)
        : 0,
    [saleDiscount, originalPrice]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Original Price */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Original Price</span>
        <span className="text-white">{formatPrice(originalPrice)}</span>
      </div>

      {/* Sale Discount */}
      <AnimatePresence>
        {saleDiscount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-1.5 text-muted">
              <TrendingDown className="h-3.5 w-3.5 text-success" />
              Sale Discount
              <Badge variant="success" className="ml-1 text-[10px] px-1.5 py-0">
                -{saleDiscountPercent}%
              </Badge>
            </span>
            <span className="text-success">
              <AnimatedAmount amount={saleDiscount} prefix="-" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Discount */}
      <AnimatePresence>
        {studentDiscount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-1.5 text-muted">
              <GraduationCap className="h-3.5 w-3.5 text-secondary" />
              Student Discount
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                -{Math.round((studentDiscount / (originalPrice - saleDiscount)) * 100)}%
              </Badge>
            </span>
            <span className="text-secondary">
              <AnimatedAmount amount={studentDiscount} prefix="-" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupon Discount */}
      <AnimatePresence>
        {couponDiscount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-1.5 text-muted">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Coupon Discount
            </span>
            <span className="text-primary">
              <AnimatedAmount amount={couponDiscount} prefix="-" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gold Coins Info */}
      {goldCoins !== undefined && goldCoins > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Gold Coins Available
          </span>
          <Badge variant="gold" className="text-[10px]">
            {goldCoins} coins
          </Badge>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border/50 my-2" />

      {/* Final Price */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">Total to Pay</span>
        <motion.span
          key={finalPrice}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-xl font-bold text-primary"
        >
          {formatPrice(finalPrice)}
        </motion.span>
      </div>

      {/* Savings Summary */}
      <AnimatePresence>
        {totalDiscount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-center"
          >
            <p className="text-xs text-success font-medium">
              You save {formatPrice(totalDiscount)} ({savingsPercent}%)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discount cap note */}
      <p className="text-[10px] text-muted/60 text-center">
        All discounts capped at 30% max combined
      </p>
    </div>
  );
}
