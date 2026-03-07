"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Users, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const courses = [
  {
    title: "Full-Stack Next.js 14 Masterclass",
    category: "Web Development",
    difficulty: "Advanced",
    techStack: ["Next.js", "React", "Prisma", "Tailwind"],
    rating: 4.9,
    students: 1240,
    price: 1499,
    mrp: 4999,
    bestseller: true,
  },
  {
    title: "React Native — Build 10 Apps",
    category: "Mobile Development",
    difficulty: "Intermediate",
    techStack: ["React Native", "Expo", "Firebase", "TypeScript"],
    rating: 4.8,
    students: 870,
    price: 999,
    mrp: 3499,
    bestseller: true,
  },
  {
    title: "DSA with JavaScript — Zero to Hero",
    category: "Data Structures",
    difficulty: "Beginner",
    techStack: ["JavaScript", "Algorithms", "LeetCode"],
    rating: 4.7,
    students: 2100,
    price: 499,
    mrp: 1999,
    bestseller: false,
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

export default function FeaturedCourses() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-black section-padding overflow-hidden">
      <div className="section-container">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm tracking-widest uppercase text-muted mb-4">
            What you&apos;ll learn
          </p>
          <h2 className="heading-lg">
            Featured <span className="font-serif italic font-normal">Courses</span>
          </h2>
          <p className="mt-4 text-muted max-w-lg text-base">
            Industry-grade courses designed to make you job-ready, not just tutorial-ready.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="group card-interactive flex flex-col p-6"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs tracking-wider uppercase text-muted">
                    {course.category}
                  </span>
                  <span className="text-xs text-border-light">•</span>
                  <span className="text-xs text-muted">{course.difficulty}</span>
                </div>
                {course.bestseller && (
                  <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    <Flame className="h-3 w-3" />
                    Popular
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold leading-snug group-hover:text-foreground/80 transition-colors mb-4">
                {course.title}
              </h3>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {course.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Rating + students */}
              <div className="flex items-center gap-4 text-sm mb-5">
                <span className="flex items-center gap-1 text-foreground/70">
                  <Star className="h-3.5 w-3.5 fill-foreground/70 text-foreground/70" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1 text-muted">
                  <Users className="h-3.5 w-3.5" />
                  {course.students.toLocaleString()} students
                </span>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Price */}
              <div className="flex items-end gap-3 pt-5 border-t border-border">
                <span className="text-2xl font-bold text-foreground font-display">
                  ₹{course.price}
                </span>
                <span className="text-sm text-muted line-through">
                  ₹{course.mrp}
                </span>
                <span className="ml-auto rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
                  {Math.round((1 - course.price / course.mrp) * 100)}% OFF
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-14 text-center"
        >
          <Link href="/courses">
            <Button variant="outline" size="lg" className="group">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
