"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Download, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const projects = [
  {
    title: "E-Commerce Platform — Full Stack",
    tech: ["Next.js", "Prisma", "Stripe", "Tailwind"],
    price: 599,
    mrp: 1499,
    downloads: 3200,
    gradient: "from-primary/30 via-primary/10 to-transparent",
  },
  {
    title: "AI Chat Application with OpenAI",
    tech: ["React", "Node.js", "OpenAI", "Socket.io"],
    price: 799,
    mrp: 1999,
    downloads: 2800,
    gradient: "from-secondary/30 via-secondary/10 to-transparent",
  },
  {
    title: "Admin Dashboard — Analytics UI",
    tech: ["Next.js", "Recharts", "Tailwind", "Zustand"],
    price: 299,
    mrp: 999,
    downloads: 4100,
    gradient: "from-gold/25 via-gold/5 to-transparent",
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

export default function PopularProjects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-surface/40 py-24 lg:py-32">
      {/* Subtle gradient bleed */}
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
            Popular <span className="text-secondary">Projects</span>
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-secondary" />
          <p className="mt-5 text-muted md:text-lg">
            Production-level source code you can learn from, customize, and ship.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
            >
              <Card className="card-hover group relative flex h-full flex-col overflow-hidden">
                {/* Thumbnail */}
                <div
                  className={`relative h-40 w-full bg-gradient-to-br ${project.gradient} bg-surface`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FolderGit2 className="h-12 w-12 text-white/20" />
                  </div>
                  <Badge
                    variant="outline"
                    className="absolute right-3 top-3 flex items-center gap-1 bg-background/60 backdrop-blur-sm"
                  >
                    <Download className="h-3 w-3" />
                    {project.downloads.toLocaleString()}
                  </Badge>
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  {/* Title */}
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-secondary transition-colors">
                    {project.title}
                  </h3>

                  {/* Tech chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Price */}
                  <div className="flex items-end gap-2 pt-3 border-t border-border">
                    <span className="text-2xl font-bold text-secondary">
                      ₹{project.price}
                    </span>
                    <span className="text-sm text-muted line-through">
                      ₹{project.mrp}
                    </span>
                    <span className="ml-auto rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                      {Math.round((1 - project.price / project.mrp) * 100)}% OFF
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
            Browse All Projects
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
