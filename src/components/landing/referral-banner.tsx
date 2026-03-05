"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Gift, ArrowRight, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReferralBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative overflow-hidden rounded-2xl border border-gold/20"
        >
          {/* Gold / orange gradient accent on left */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-gold via-primary to-gold" />

          {/* Background glow */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-8 px-8 py-10 md:flex-row md:gap-12 md:px-14 md:py-14">
            {/* Left icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20">
              <Gift className="h-8 w-8 text-gold" />
            </div>

            {/* Copy */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold md:text-3xl">
                Refer &amp; Earn Gold Coins{" "}
                <span className="text-gold">🪙</span>
              </h3>
              <p className="mt-2 max-w-xl text-muted md:text-lg">
                Share your unique referral code with friends. Earn{" "}
                <span className="font-semibold text-gold">15 coins</span> for
                every referral purchase. Redeem coins for a{" "}
                <span className="font-semibold text-primary">
                  20% discount coupon
                </span>{" "}
                on any course or project!
              </p>
              <div className="mt-6">
                <Button size="lg" variant="gold" className="group">
                  Start Referring
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            {/* Right visual — floating coins */}
            <div className="hidden shrink-0 md:block">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                  <Coins className="h-12 w-12 text-gold" />
                </div>
                {/* Small floating coins */}
                <motion.div
                  animate={{ y: [0, -6, 0], x: [0, 4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-3 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold"
                >
                  +15
                </motion.div>
                <motion.div
                  animate={{ y: [0, -5, 0], x: [0, -3, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="absolute -bottom-1 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary"
                >
                  🪙
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
