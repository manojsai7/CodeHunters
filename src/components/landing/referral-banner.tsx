"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReferralBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative bg-black section-padding">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="rounded-2xl border border-border bg-surface-light/50 px-8 py-14 text-center md:px-16 md:py-20"
        >
          <p className="text-sm tracking-widest uppercase text-muted mb-4">
            Referral Program
          </p>
          <h3 className="heading-lg mb-4">
            Refer Friends.{" "}
            <span className="font-serif italic font-normal">Earn Rewards.</span>
          </h3>
          <p className="mx-auto max-w-lg text-muted text-base mb-8">
            Share your unique referral code and earn <span className="text-white font-medium">15 gold coins</span> for
            every purchase. Redeem coins for <span className="text-white font-medium">20% off</span> any course or project.
          </p>
          <Link href="/dashboard/referrals">
            <Button variant="default" size="lg" className="group">
              Start Referring
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
