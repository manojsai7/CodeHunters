"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    mrp: number;
    thumbnail: string;
    category: string;
    difficulty: string;
    techTags: string[];
    purchasesCount: number;
    rating: number;
    reviewCount: number;
    isBestseller: boolean;
  };
  index?: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? "fill-gold text-gold"
              : "fill-none text-muted/40"
          }`}
        />
      ))}
    </div>
  );
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const hasSale = course.price < course.mrp;
  const discountPercent = hasSale
    ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/courses/${course.slug}`} className="group block h-full">
        <div className="h-full overflow-hidden rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/20">
                <span className="text-3xl font-bold text-foreground/30">CH</span>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              <Badge variant="default" className="text-[10px]">
                {course.category}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {course.difficulty}
              </Badge>
            </div>

            {course.isBestseller && (
              <div className="absolute right-3 top-3">
                <Badge variant="bestseller" className="text-[10px]">
                  Bestseller
                </Badge>
              </div>
            )}

            {hasSale && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="error" className="text-[10px] font-bold">
                  {discountPercent}% OFF
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 p-4">
            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
              {course.title}
            </h3>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-1">
              {course.techTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted"
                >
                  {tag}
                </span>
              ))}
              {course.techTags.length > 3 && (
                <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted">
                  +{course.techTags.length - 3} more
                </span>
              )}
            </div>

            {/* Rating + Students */}
            <div className="flex items-center gap-3 text-xs text-muted">
              <div className="flex items-center gap-1">
                <StarRating rating={course.rating} />
                <span className="font-medium text-gold">
                  {course.rating.toFixed(1)}
                </span>
                <span>({course.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{course.purchasesCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(course.price)}
                </span>
                {hasSale && (
                  <span className="text-xs text-muted line-through">
                    {formatPrice(course.mrp)}
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                View Course
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
