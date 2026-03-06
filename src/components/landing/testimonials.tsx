"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    name: "Arjun Kumar",
    role: "Full-Stack Developer @ Flipkart",
    quote:
      "Code Hunters' Next.js course was hands-down the best investment I made. The project-based approach helped me crack my interview within 3 months. The code quality is genuinely production-grade.",
  },
  {
    name: "Priya Sharma",
    role: "Freelance React Developer",
    quote:
      "The project source codes are production-level — not toy apps. I shipped two real client projects using templates I customised from Code Hunters. Paid for itself on day one.",
  },
  {
    name: "Rahul Verma",
    role: "CS Student, IIT Delhi",
    quote:
      "The DSA course finally made algorithms click for me. Clean explanations, real LeetCode walkthroughs, and a supportive community. Genuinely worth every rupee.",
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

export default function Testimonials() {
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
            Success Stories
          </p>
          <h2 className="heading-lg">
            Real <span className="font-serif italic font-normal">Results</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="flex flex-col gap-6 rounded-2xl border border-border bg-surface-light/50 p-8"
            >
              {/* Quote text */}
              <p className="flex-1 text-[15px] leading-relaxed text-white/70">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
