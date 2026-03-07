"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tiers = [
  {
    title: "COURSES",
    subtitle: "For learners who want depth",
    price: "₹499",
    originalPrice: "₹1,999",
    highlight: false,
    features: [
      "Full HD video lectures",
      "Lifetime access & updates",
      "Source code included",
      "Certificate of completion",
      "Community support",
    ],
    cta: "Browse Courses",
    href: "/courses",
  },
  {
    title: "PROJECTS",
    subtitle: "For builders who ship fast",
    price: "₹299",
    originalPrice: "₹999",
    highlight: true,
    label: "MOST POPULAR",
    features: [
      "Production-ready source code",
      "Step-by-step documentation",
      "Modern tech stack",
      "Free updates for 1 year",
      "Priority Discord support",
    ],
    cta: "Browse Projects",
    href: "/projects",
  },
  {
    title: "BUNDLES",
    subtitle: "For serious career builders",
    price: "Combo",
    originalPrice: "",
    highlight: false,
    features: [
      "Course + Project combos",
      "Up to 40% extra savings",
      "Exclusive bonus content",
      "Early access to new drops",
      "Premium community badge",
    ],
    cta: "View Bundles",
    href: "/courses",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-black section-padding">
      <div className="section-container">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm tracking-widest uppercase text-muted mb-4">
            Pricing
          </p>
          <h2 className="heading-lg">
            The Best <span className="font-serif italic font-normal">Prices</span> Ever
          </h2>
          <p className="mt-4 text-muted text-base">
            Pay once, own forever. No subscriptions.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                tier.highlight
                  ? "border-white/20 bg-surface-light"
                  : "border-border bg-surface/50"
              }`}
            >
              {/* Popular label */}
              {tier.label && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-white px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                    {tier.label}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-sm font-semibold tracking-widest text-muted uppercase">
                {tier.title}
              </h3>
              <p className="mt-2 text-sm text-muted/70">{tier.subtitle}</p>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-2">
                {tier.originalPrice && (
                  <span className="text-sm text-muted line-through">{tier.originalPrice}</span>
                )}
                <span className="text-4xl font-bold font-display text-foreground">
                  {tier.price}
                </span>
                {tier.originalPrice && (
                  <span className="text-sm text-muted">starting</span>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-border" />

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40" />
                    <span className="text-muted">{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="flex-1" />

              {/* CTA */}
              <Link href={tier.href}>
                <Button
                  variant={tier.highlight ? "default" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
