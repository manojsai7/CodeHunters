"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Users, ArrowRight, BookOpen, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
    gradient: "from-primary/40 to-secondary/30",
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
    gradient: "from-secondary/40 to-gold/20",
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
    gradient: "from-gold/30 to-primary/30",
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

export default function FeaturedCourses() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-background py-24 lg:py-32 overflow-hidden">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute -left-40 bottom-20 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />

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
            Featured <span className="text-primary">Courses</span>
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-primary to-secondary" />
          <p className="mt-5 text-muted md:text-lg">
            Industry-grade courses designed to make you job-ready, not just
            tutorial-ready.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
            >
              <Card className="card-hover group relative flex h-full flex-col overflow-hidden">
                {/* Thumbnail */}
                <div
                  className={`relative h-44 w-full bg-gradient-to-br ${course.gradient}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/30" />
                  </div>
                  {course.bestseller && (
                    <Badge
                      variant="bestseller"
                      className="absolute left-3 top-3 flex items-center gap-1"
                    >
                      <Flame className="h-3 w-3" />
                      Bestseller
                    </Badge>
                  )}
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  {/* Category & Difficulty */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{course.difficulty}</Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  {/* Tech chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {course.techStack.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-surface-hover px-2 py-0.5 text-xs text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Rating + students */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-gold">
                      <Star className="h-4 w-4 fill-gold" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1 text-muted">
                      <Users className="h-4 w-4" />
                      {course.students.toLocaleString()}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Price */}
                  <div className="flex items-end gap-2 pt-2 border-t border-border">
                    <span className="text-2xl font-bold text-primary">
                      ₹{course.price}
                    </span>
                    <span className="text-sm text-muted line-through">
                      ₹{course.mrp}
                    </span>
                    <span className="ml-auto rounded-md bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      {Math.round((1 - course.price / course.mrp) * 100)}% OFF
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" size="lg" className="group">
            View All Courses
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
