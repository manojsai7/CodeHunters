"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stats = [
  { label: "Students", value: "500+" },
  { label: "Courses", value: "50+" },
  { label: "Projects", value: "100+" },
  { label: "Rating", value: "4.9" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 lg:px-10 pt-32 pb-20 lg:pt-44 lg:pb-28">
        {/* Center-aligned editorial hero */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-8"
          >
            {/* Small tag */}
            <motion.p custom={0} variants={fadeUp} className="text-sm tracking-widest uppercase text-muted">
              Code Hunters presents
            </motion.p>

            {/* Main headline — editorial mixed typography */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="max-w-4xl"
            >
              <span className="block text-4xl font-light text-muted font-display md:text-5xl lg:text-6xl">
                not just another
              </span>
              <span className="block mt-2 text-5xl font-bold tracking-tight text-white font-display md:text-7xl lg:text-8xl">
                Programming
              </span>
              <span className="block mt-1 text-5xl font-bold tracking-tight text-white font-display md:text-7xl lg:text-8xl">
                <span className="font-serif italic font-normal">Course</span> Platform
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              custom={2}
              variants={fadeUp}
              className="max-w-xl text-base text-muted md:text-lg leading-relaxed"
            >
              Premium courses and production-ready projects to master
              real-world development. Learn from practitioners, not just instructors.
            </motion.p>

            {/* CTAs */}
            <motion.div custom={3} variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/courses">
                <Button size="lg" className="group">
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline" size="lg">
                  Browse Projects
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-24 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold font-display md:text-4xl text-white">
                {stat.value}
              </span>
              <span className="text-xs tracking-wider uppercase text-muted">
                {stat.label}
              </span>
              {i < stats.length - 1 && (
                <span className="hidden sm:block absolute" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="mt-20 h-px w-full bg-gradient-to-r from-transparent via-border-light to-transparent" />
      </div>
    </section>
  );
}
