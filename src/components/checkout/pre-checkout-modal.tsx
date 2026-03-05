"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  X,
  ChevronLeft,
  GraduationCap,
  Info,
  Tag,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PriceBreakdown } from "@/components/checkout/price-breakdown";

import { preCheckoutSchema, type PreCheckoutFormData } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";
import { isBlockedEmail } from "@/utils/emailTrust";
import { INDIAN_STATES, STUDENT_DISCOUNT_PERCENT } from "@/utils/constants";
import {
  useCheckout,
  type CheckoutItem,
  type CheckoutUser,
} from "@/hooks/use-checkout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CheckoutItem;
  user?: CheckoutUser;
}

// ─── State Options ────────────────────────────────────────────────────────────

const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

// ─── Animation Variants ───────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const desktopModalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const mobileSheetVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PreCheckoutModal({
  isOpen,
  onClose,
  item,
  user,
}: PreCheckoutModalProps) {
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [studentAutoDetected, setStudentAutoDetected] = useState(false);

  const {
    step,
    setStep,
    priceBreakdown,
    coupon,
    emailClassification,
    isSubmitting,
    isVerifying,
    isCouponLoading,
    razorpayLoaded,
    submitLead,
    applyCoupon,
    removeCoupon,
    initiatePayment,
    classifyUserEmail,
  } = useCheckout(item);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(preCheckoutSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      state: "",
      selfDeclaredStudent: false,
      productId: item.id,
      productType: item.type as "course" | "project",
      couponCode: "",
    },
  });

  const selfDeclaredStudent = watch("selfDeclaredStudent") as boolean;
  const emailValue = watch("email") as string;

  // ─── Responsive Detection ─────────────────────────────────────────────────

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ─── Body Scroll Lock ─────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ─── Email Blur Handler ───────────────────────────────────────────────────

  const handleEmailBlur = useCallback(() => {
    if (!emailValue) return;

    const result = classifyUserEmail(emailValue);
    setEmailWarning(null);
    setStudentAutoDetected(false);

    if (result === "blocked") {
      setEmailWarning("Temporary/disposable emails are not allowed");
    } else if (result === "student") {
      setValue("selfDeclaredStudent", true);
      setStudentAutoDetected(true);
    }
  }, [emailValue, classifyUserEmail, setValue]);

  // ─── Form Submit Handler ──────────────────────────────────────────────────

  const onFormSubmit = useCallback(
    (data: Record<string, unknown>) => {
      const formValues = data as PreCheckoutFormData;
      if (isBlockedEmail(formValues.email)) {
        toast.error("Please use a valid email address");
        return;
      }

      submitLead({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        state: formValues.state,
        selfDeclaredStudent: formValues.selfDeclaredStudent,
        couponCode: coupon?.valid ? coupon.code : "",
      });
    },
    [submitLead, coupon]
  );

  // ─── Coupon Apply ─────────────────────────────────────────────────────────

  const handleApplyCoupon = useCallback(() => {
    applyCoupon(couponInput);
  }, [applyCoupon, couponInput]);

  // ─── Swipe-to-close handler for mobile ────────────────────────────────────

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose]
  );

  // ─── Content Render ───────────────────────────────────────────────────────

  const renderStepContent = () => {
    if (step === "lead") {
      return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Item Summary */}
          <div className="flex items-center gap-3 rounded-lg bg-surface/50 border border-border/50 p-3">
            {item.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {item.title}
              </p>
              <p className="text-xs text-muted capitalize">{item.type}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {item.salePrice ? (
                <>
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(item.salePrice)}
                  </p>
                  <p className="text-xs text-muted line-through">
                    {formatPrice(item.price)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-primary">
                  {formatPrice(item.price)}
                </p>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Full Name
            </label>
            <Input
              {...register("name")}
              placeholder="Enter your full name"
              error={errors.name?.message}
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Email Address
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              onBlur={handleEmailBlur}
              error={errors.email?.message || emailWarning || undefined}
            />
            {studentAutoDetected && (
              <p className="mt-1 flex items-center gap-1 text-xs text-secondary">
                <GraduationCap className="h-3 w-3" />
                Student email detected! Discount auto-applied.
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm text-muted">
                +91
              </span>
              <Input
                {...register("phone")}
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                error={errors.phone?.message}
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              State
            </label>
            <Select
              {...register("state")}
              options={stateOptions}
              placeholder="Select your state"
              error={errors.state?.message}
            />
          </div>

          {/* Student Checkbox */}
          <div className="space-y-1.5">
            <Checkbox
              {...register("selfDeclaredStudent")}
              label={`I am a Student (${STUDENT_DISCOUNT_PERCENT}% discount)`}
              checked={selfDeclaredStudent}
              onChange={(e) => setValue("selfDeclaredStudent", e.target.checked)}
            />
            {selfDeclaredStudent && emailClassification !== "student" && (
              <p className="ml-6 flex items-center gap-1 text-xs text-muted">
                <Info className="h-3 w-3 text-gold" />
                Student verification required after purchase
              </p>
            )}
          </div>

          {/* Coupon Code */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Coupon Code (optional)
            </label>
            {coupon?.valid ? (
              <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">
                    {coupon.code}
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    {coupon.type === "percent"
                      ? `-${coupon.discount}%`
                      : `-₹${coupon.discount}`}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-muted hover:text-white transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={handleApplyCoupon}
                  isLoading={isCouponLoading}
                  disabled={!couponInput.trim() || isCouponLoading}
                >
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Hidden fields */}
          <input type="hidden" {...register("productId")} />
          <input type="hidden" {...register("productType")} />

          {/* Price Breakdown */}
          <div className="rounded-lg border border-border/50 bg-surface/30 p-4">
            <PriceBreakdown
              breakdown={priceBreakdown}
              goldCoins={user?.goldCoins}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full text-base font-semibold"
          >
            Continue to Payment
          </Button>

          {!user && (
            <p className="text-center text-[10px] text-muted/60">
              Checking out as guest. Sign in for a personalized experience.
            </p>
          )}
        </form>
      );
    }

    // Step: Payment
    return (
      <div className="space-y-5">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setStep("lead")}
          className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Edit details
        </button>

        {/* Order Summary */}
        <div className="rounded-lg border border-border/50 bg-surface/30 p-4 space-y-3">
          <h3 className="text-sm font-medium text-white">Order Summary</h3>

          <div className="flex items-center gap-3">
            {item.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white truncate">{item.title}</p>
              <p className="text-xs text-muted capitalize">{item.type}</p>
            </div>
          </div>

          <PriceBreakdown
            breakdown={priceBreakdown}
            goldCoins={user?.goldCoins}
          />
        </div>

        {/* Pay Button */}
        <Button
          onClick={initiatePayment}
          size="lg"
          className="w-full text-base font-semibold"
          isLoading={isSubmitting || isVerifying}
          disabled={isSubmitting || isVerifying || !razorpayLoaded}
        >
          {isVerifying ? (
            "Verifying Payment..."
          ) : isSubmitting ? (
            "Processing..."
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Proceed to Pay {formatPrice(priceBreakdown.finalPrice)}
            </span>
          )}
        </Button>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted/60">
          <ShieldCheck className="h-3 w-3" />
          <span>Secured by Razorpay. 100% safe & encrypted.</span>
        </div>
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal / Bottom Sheet */}
          {isMobile ? (
            /* ── Mobile Bottom Sheet ─────────────────────────────── */
            <motion.div
              ref={sheetRef}
              variants={mobileSheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={handleDragEnd}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] rounded-t-2xl bg-[#0F0F0F] border-t border-border/50 shadow-2xl flex flex-col"
            >
              {/* Drag Handle */}
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="h-1 w-10 rounded-full bg-muted/40" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-border/30">
                <h2 className="text-base font-semibold text-white">
                  {step === "lead" ? "Complete Your Details" : "Confirm & Pay"}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted hover:text-white hover:bg-surface transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
                {renderStepContent()}
              </div>
            </motion.div>
          ) : (
            /* ── Desktop Centered Modal ──────────────────────────── */
            <motion.div
              variants={desktopModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md max-h-[90vh] rounded-2xl bg-[#0F0F0F] border border-border/50 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                  <h2 className="text-lg font-semibold text-white">
                    {step === "lead"
                      ? "Complete Your Details"
                      : "Confirm & Pay"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1.5 text-muted hover:text-white hover:bg-surface transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {renderStepContent()}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
