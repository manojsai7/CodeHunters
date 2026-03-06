"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const projects = [
  {
    title: "E-Commerce Platform — Full Stack",
    tech: ["Next.js", "Prisma", "Stripe", "Tailwind"],
    price: 599,
    mrp: 1499,
    downloads: "3.2k",
  },
  {
    title: "AI Chat Application with OpenAI",
    tech: ["React", "Node.js", "OpenAI", "Socket.io"],
    price: 799,
    mrp: 1999,
    downloads: "2.8k",
  },
  {
    title: "Admin Dashboard — Analytics UI",
    tech: ["Next.js", "Recharts", "Tailwind", "Zustand"],
    price: 299,
    mrp: 999,
    downloads: "4.1k",
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

export default function PopularProjects() {
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
          className="mb-16"
        >
          <p className="text-sm tracking-widest uppercase text-muted mb-4">
            Ready-to-Ship
          </p>
          <div className="flex items-end justify-between">
            <h2 className="heading-lg">
              Popular <span className="font-serif italic font-normal">Projects</span>
            </h2>
            <Link href="/projects" className="hidden md:block">
              <Button variant="outline" size="sm" className="group">
                View All
                <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="card-interactive flex flex-col gap-4 p-6"
            >
              {/* Title */}
              <h3 className="text-lg font-semibold font-display leading-snug text-white">
                {project.title}
              </h3>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex-1" />

              {/* Price + downloads */}
              <div className="flex items-end justify-between border-t border-border pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-white">
                    ₹{project.price}
                  </span>
                  <span className="text-sm text-muted line-through">₹{project.mrp}</span>
                </div>
                <span className="text-xs text-muted">{project.downloads} downloads</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center md:hidden">
          <Link href="/projects">
            <Button variant="outline" size="lg" className="group">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
