"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    initials: "AK",
    name: "Arjun Kumar",
    role: "Full-Stack Developer @ Flipkart",
    rating: 5,
    quote:
      "Code Hunters' Next.js course was hands-down the best investment I made. The project-based approach helped me crack my interview within 3 months.",
  },
  {
    initials: "PS",
    name: "Priya Sharma",
    role: "Freelance React Developer",
    rating: 5,
    quote:
      "The project source codes are production-level — not toy apps. I shipped two client projects using templates I customised from Code Hunters.",
  },
  {
    initials: "RV",
    name: "Rahul Verma",
    role: "CS Student, IIT Delhi",
    rating: 5,
    quote:
      "The DSA course finally made algorithms click for me. Clean explanations, real LeetCode walkthroughs, and a supportive community. Genuinely worth every rupee.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold md:text-5xl">
            What Our <span className="text-gradient">Students Say</span>
          </h2>
          <p className="mt-5 text-muted md:text-lg">
            Real feedback from real learners — unfiltered.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="glass flex flex-col gap-5 rounded-2xl p-6 lg:p-8"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/40" />

              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 fill-gold text-gold"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="flex-1 text-sm leading-relaxed text-muted md:text-base">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border/50 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
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
