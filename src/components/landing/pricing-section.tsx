"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, FolderGit2, PackageCheck, Check } from "lucide-react";

const tiers = [
  {
    icon: BookOpen,
    title: "Courses",
    price: "Starting from ₹499",
    highlight: false,
    features: [
      "Full HD video lectures",
      "Lifetime access & updates",
      "Source code included",
      "Certificate of completion",
      "Community support",
    ],
  },
  {
    icon: FolderGit2,
    title: "Projects",
    price: "Starting from ₹299",
    highlight: true,
    features: [
      "Production-ready source code",
      "Step-by-step documentation",
      "Modern tech stack",
      "Free updates for 1 year",
      "Priority Discord support",
    ],
  },
  {
    icon: PackageCheck,
    title: "Bundle Deals",
    price: "Combo packs available",
    highlight: false,
    features: [
      "Course + Project combos",
      "Up to 40% extra savings",
      "Exclusive bonus content",
      "Early access to new drops",
      "Premium community badge",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-surface/30 py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold md:text-5xl">
            Simple, Transparent{" "}
            <span className="text-primary">Pricing</span>
          </h2>
          <p className="mt-5 text-muted md:text-lg">
            No subscriptions. Pay once, own forever.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className={`relative flex flex-col rounded-2xl border p-8 lg:p-10 transition-all duration-300 ${
                tier.highlight
                  ? "border-primary/60 bg-surface shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border bg-surface/60 hover:border-border/80"
              }`}
            >
              {/* Glow ring for highlighted card */}
              {tier.highlight && (
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 pointer-events-none" />
              )}

              <div className="relative flex flex-col gap-6">
                {/* Icon */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    tier.highlight
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-hover text-muted"
                  }`}
                >
                  <tier.icon className="h-7 w-7" />
                </div>

                {/* Title & Price */}
                <div>
                  <h3 className="text-xl font-bold">{tier.title}</h3>
                  <p
                    className={`mt-1 text-lg font-semibold ${
                      tier.highlight ? "text-primary" : "text-muted"
                    }`}
                  >
                    {tier.price}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          tier.highlight ? "text-primary" : "text-success"
                        }`}
                      />
                      <span className="text-muted">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
