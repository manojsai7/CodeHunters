"use client";

import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRazorpay } from "@/hooks/use-razorpay";
import { cn, formatPrice } from "@/lib/utils";

interface RazorpayButtonProps {
  orderId: string;
  amount: number;
  currency?: string;
  name?: string;
  email?: string;
  phone?: string;
  itemTitle: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

export function RazorpayButton({
  orderId,
  amount,
  currency = "INR",
  name,
  email,
  phone,
  itemTitle,
  onSuccess,
  onFailure,
  disabled,
  className,
}: RazorpayButtonProps) {
  const { isLoaded, openPayment } = useRazorpay();
  const [isPaying, setIsPaying] = useState(false);

  const handleClick = useCallback(async () => {
    if (!isLoaded) return;

    setIsPaying(true);
    try {
      const response = await openPayment({
        orderId,
        amount,
        currency,
        name,
        email,
        phone,
        itemTitle,
      });
      onSuccess(response);
    } catch (error) {
      onFailure(error instanceof Error ? error : new Error("Payment failed"));
    } finally {
      setIsPaying(false);
    }
  }, [isLoaded, openPayment, orderId, amount, currency, name, email, phone, itemTitle, onSuccess, onFailure]);

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !isLoaded || isPaying}
      isLoading={isPaying || !isLoaded}
      size="lg"
      className={cn("w-full text-base font-semibold", className)}
    >
      {isPaying ? (
        "Processing..."
      ) : !isLoaded ? (
        "Loading Payment..."
      ) : (
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Pay {formatPrice(amount / 100)}
        </span>
      )}
    </Button>
  );
}
