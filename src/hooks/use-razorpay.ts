"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface OpenPaymentParams {
  orderId: string;
  amount: number;
  currency?: string;
  name?: string;
  email?: string;
  phone?: string;
  itemTitle: string;
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Check if script is already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      return;
    }

    // Inject script
    setIsLoading(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      setIsLoading(false);
      console.error("Failed to load Razorpay SDK");
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Cleanup only if we added the script
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  const openPayment = useCallback(
    (params: OpenPaymentParams): Promise<RazorpaySuccessResponse> => {
      return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error("Razorpay SDK not loaded"));
          return;
        }

        const options: RazorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: params.amount, // Amount in paise
          currency: params.currency || "INR",
          name: "Code Hunters",
          description: params.itemTitle,
          order_id: params.orderId,
          prefill: {
            name: params.name,
            email: params.email,
            contact: params.phone ? `+91${params.phone}` : undefined,
          },
          theme: {
            color: "#FF6B35",
          },
          handler: (response: RazorpaySuccessResponse) => {
            resolve(response);
          },
          modal: {
            ondismiss: () => {
              reject(new Error("Payment cancelled by user"));
            },
            escape: true,
            backdropclose: false,
          },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", () => {
          reject(new Error("Payment failed"));
        });

        rzp.open();
      });
    },
    []
  );

  return { isLoaded, isLoading, openPayment };
}
