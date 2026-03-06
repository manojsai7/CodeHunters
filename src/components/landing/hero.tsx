"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code2, Users, FolderGit2, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stats = [
  { icon: Users, label: "Students", value: "500+" },
  { icon: FolderGit2, label: "Projects", value: "100+" },
  { icon: BookOpen, label: "Courses", value: "50+" },
  { icon: Star, label: "Rating", value: "4.9★" },
];

const codeLines = [
  { indent: 0, tokens: [{ text: "const", color: "text-secondary" }, { text: " hunter", color: "text-primary" }, { text: " = {", color: "text-white" }] },
  { indent: 1, tokens: [{ text: "name:", color: "text-muted" }, { text: ' "Code Hunter"', color: "text-success" }, { text: ",", color: "text-white" }] },
  { indent: 1, tokens: [{ text: "skills:", color: "text-muted" }, { text: " [", color: "text-white" }] },
  { indent: 2, tokens: [{ text: '"React"', color: "text-primary" }, { text: ",", color: "text-white" }, { text: ' "Next.js"', color: "text-secondary" }, { text: ",", color: "text-white" }] },
  { indent: 2, tokens: [{ text: '"TypeScript"', color: "text-gold" }, { text: ",", color: "text-white" }, { text: ' "Tailwind"', color: "text-secondary" }] },
  { indent: 1, tokens: [{ text: "],", color: "text-white" }] },
  { indent: 1, tokens: [{ text: "level:", color: "text-muted" }, { text: ' "Pro"', color: "text-gold" }, { text: ",", color: "text-white" }] },
  { indent: 0, tokens: [{ text: "};", color: "text-white" }] },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradient mesh background */}
      <div className="gradient-mesh absolute inset-0 pointer-events-none" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl animate-float [animation-delay:1.5s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Copy */}
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6"
            >
              <motion.div custom={0} variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20">
                  <Code2 className="h-4 w-4" />
                  Premium Learning Platform
                </span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-5xl font-bold leading-tight tracking-tight md:text-7xl"
              >
                Hunt the Skills.
                <br />
                <span className="text-gradient">Build the Future.</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="max-w-lg text-lg text-muted md:text-xl"
              >
                Master real-world development with premium courses, production-ready
                projects, and a community that pushes you forward.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
                <Button size="xl" className="group">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="xl">
                  Browse Projects
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right — Code editor mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-2xl" />

              <div className="glass relative rounded-2xl p-1">
                {/* Title bar */}
                <div className="flex items-center gap-2 rounded-t-xl bg-surface px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-error/80" />
                  <span className="h-3 w-3 rounded-full bg-gold/80" />
                  <span className="h-3 w-3 rounded-full bg-success/80" />
                  <span className="ml-3 text-xs text-muted">hunter.ts</span>
                </div>

                {/* Code body */}
                <div className="space-y-1 rounded-b-xl bg-background/80 px-5 py-5 font-mono text-sm leading-relaxed">
                  {codeLines.map((line, li) => (
                    <motion.div
                      key={li}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + li * 0.08, duration: 0.4 }}
                      className="flex"
                      style={{ paddingLeft: `${line.indent * 1.25}rem` }}
                    >
                      {line.tokens.map((tok, ti) => (
                        <span key={ti} className={tok.color}>
                          {tok.text}
                        </span>
                      ))}
                    </motion.div>
                  ))}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: 1.4, duration: 1, repeat: Infinity }}
                    className="mt-1 inline-block h-5 w-2 bg-primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1, delayChildren: 0.7 }}
          className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="glass flex flex-col items-center gap-2 rounded-xl px-6 py-5 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default"
            >
              <stat.icon className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold md:text-3xl">{stat.value}</span>
              <span className="text-sm text-muted">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
