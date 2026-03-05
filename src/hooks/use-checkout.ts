"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/use-razorpay";
import {
  STUDENT_DISCOUNT_PERCENT,
  MAX_TOTAL_DISCOUNT_PERCENT,
} from "@/utils/constants";
import { classifyEmail } from "@/utils/emailTrust";
import type { EmailTrustLevel } from "@/utils/emailTrust";

export type CheckoutStep = "lead" | "payment" | "processing";

export interface CheckoutItem {
  id: string;
  type: "course" | "project";
  title: string;
  price: number;
  salePrice?: number;
  thumbnailUrl?: string;
}

export interface CheckoutUser {
  id: string;
  email: string;
  name: string;
  goldCoins: number;
}

export interface CouponResult {
  valid: boolean;
  discount: number;
  type: "percent" | "flat";
  code: string;
  message?: string;
}

export interface PriceBreakdownData {
  originalPrice: number;
  saleDiscount: number;
  studentDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  finalPrice: number;
  savingsPercent: number;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  state: string;
  selfDeclaredStudent: boolean;
  couponCode: string;
}

export function useCheckout(item: CheckoutItem) {
  const router = useRouter();
  const { isLoaded: razorpayLoaded, openPayment } = useRazorpay();

  const [step, setStep] = useState<CheckoutStep>("lead");
  const [formData, setFormData] = useState<LeadFormData | null>(null);
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailClassification, setEmailClassification] =
    useState<EmailTrustLevel | null>(null);

  // Determine effective base price (sale price if exists)
  const basePrice = item.salePrice ?? item.price;

  const priceBreakdown = useMemo((): PriceBreakdownData => {
    const originalPrice = item.price;
    const saleDiscount = item.salePrice ? item.price - item.salePrice : 0;

    // Calculate student discount on the sale price (or original if no sale)
    const isStudentEligible =
      formData?.selfDeclaredStudent && emailClassification === "student";
    const studentDiscountPercent = isStudentEligible
      ? STUDENT_DISCOUNT_PERCENT
      : 0;
    const studentDiscount = Math.round(
      basePrice * (studentDiscountPercent / 100)
    );

    // Calculate coupon discount on the base price
    let couponDiscountAmount = 0;
    if (coupon?.valid) {
      if (coupon.type === "percent") {
        couponDiscountAmount = Math.round(
          basePrice * (coupon.discount / 100)
        );
      } else {
        couponDiscountAmount = coupon.discount;
      }
    }

    // Combine student + coupon discount percentages, cap at MAX
    const combinedDiscountPercent =
      studentDiscountPercent +
      (coupon?.valid && coupon.type === "percent" ? coupon.discount : 0);
    const cappedPercent = Math.min(
      combinedDiscountPercent,
      MAX_TOTAL_DISCOUNT_PERCENT
    );

    // If combined exceeds cap, recalculate
    let effectiveStudentDiscount = studentDiscount;
    let effectiveCouponDiscount = couponDiscountAmount;

    if (combinedDiscountPercent > MAX_TOTAL_DISCOUNT_PERCENT) {
      const totalCappedDiscount = Math.round(
        basePrice * (cappedPercent / 100)
      );
      // Prioritize student discount, then coupon gets the remainder
      effectiveStudentDiscount = Math.min(studentDiscount, totalCappedDiscount);
      effectiveCouponDiscount = totalCappedDiscount - effectiveStudentDiscount;
    }

    // For flat coupon discounts, also respect cap
    if (coupon?.valid && coupon.type === "flat") {
      const maxDiscountAmount = Math.round(
        basePrice * (MAX_TOTAL_DISCOUNT_PERCENT / 100)
      );
      const totalPostSaleDiscount =
        effectiveStudentDiscount + couponDiscountAmount;
      if (totalPostSaleDiscount > maxDiscountAmount) {
        effectiveCouponDiscount = Math.max(
          0,
          maxDiscountAmount - effectiveStudentDiscount
        );
      } else {
        effectiveCouponDiscount = couponDiscountAmount;
      }
    }

    const totalDiscount =
      saleDiscount + effectiveStudentDiscount + effectiveCouponDiscount;
    const finalPrice = Math.max(0, originalPrice - totalDiscount);
    const savingsPercent =
      originalPrice > 0
        ? Math.round((totalDiscount / originalPrice) * 100)
        : 0;

    return {
      originalPrice,
      saleDiscount,
      studentDiscount: effectiveStudentDiscount,
      couponDiscount: effectiveCouponDiscount,
      totalDiscount,
      finalPrice,
      savingsPercent,
    };
  }, [
    item.price,
    item.salePrice,
    basePrice,
    formData?.selfDeclaredStudent,
    emailClassification,
    coupon,
  ]);

  const classifyUserEmail = useCallback((email: string) => {
    const result = classifyEmail(email);
    setEmailClassification(result);
    return result;
  }, []);

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        toast.error("Please enter a coupon code");
        return;
      }

      setIsCouponLoading(true);
      try {
        const res = await fetch("/api/coupon/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code.trim(),
            productId: item.id,
            productType: item.type,
          }),
        });

        const data = await res.json();

        if (res.ok && data.valid) {
          setCoupon({
            valid: true,
            discount: data.discount,
            type: data.type,
            code: code.trim(),
            message: data.message,
          });
          toast.success(data.message || "Coupon applied successfully!");
        } else {
          setCoupon(null);
          toast.error(data.message || "Invalid coupon code");
        }
      } catch {
        setCoupon(null);
        toast.error("Failed to validate coupon. Please try again.");
      } finally {
        setIsCouponLoading(false);
      }
    },
    [item.id, item.type]
  );

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    toast.info("Coupon removed");
  }, []);

  const submitLead = useCallback(
    async (data: LeadFormData) => {
      setFormData(data);
      setStep("payment");
    },
    []
  );

  const initiatePayment = useCallback(async () => {
    if (!formData) {
      toast.error("Please fill in your details first");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id,
          productType: item.type,
          amount: priceBreakdown.finalPrice,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          state: formData.state,
          selfDeclaredStudent: formData.selfDeclaredStudent,
          couponCode: coupon?.valid ? coupon.code : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setStep("processing");

      // Open Razorpay
      const paymentResponse = await openPayment({
        orderId: data.orderId,
        amount: data.amount,
        itemTitle: item.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      // Verify payment
      await verifyPayment(paymentResponse);
    } catch (error) {
      setStep("payment");
      if (error instanceof Error && error.message === "Payment cancelled by user") {
        toast.info("Payment cancelled");
      } else {
        toast.error(
          error instanceof Error ? error.message : "Payment failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, item, priceBreakdown.finalPrice, coupon, openPayment]);

  const verifyPayment = useCallback(
    async (paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      setIsVerifying(true);
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          toast.success("Payment successful!");
          router.push(`/payment/success?orderId=${data.orderId}`);
        } else {
          throw new Error(data.message || "Payment verification failed");
        }
      } catch {
        toast.error("Payment verification failed. Contact support if amount was deducted.");
        router.push("/payment/failed");
      } finally {
        setIsVerifying(false);
      }
    },
    [router]
  );

  return {
    // State
    step,
    setStep,
    formData,
    priceBreakdown,
    coupon,
    emailClassification,
    isSubmitting,
    isVerifying,
    isCouponLoading,
    razorpayLoaded,

    // Actions
    submitLead,
    applyCoupon,
    removeCoupon,
    initiatePayment,
    classifyUserEmail,
  };
}
