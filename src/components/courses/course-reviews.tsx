"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  userName: string;
  createdAt: string | Date;
}

interface CourseReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  hasPurchased: boolean;
}

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          style={{ width: size, height: size }}
          className={
            star <= Math.round(rating)
              ? "fill-gold text-gold"
              : "fill-none text-muted/40"
          }
        />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-12 text-right text-muted">{stars} star</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-muted">{count}</span>
    </div>
  );
}

export function CourseReviews({
  reviews,
  averageRating,
  totalReviews,
  hasPurchased,
}: CourseReviewsProps) {
  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-white">Student Reviews</h3>

      {totalReviews > 0 ? (
        <>
          {/* Rating Overview */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10 rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm p-6">
            {/* Average */}
            <div className="flex flex-col items-center gap-2 sm:min-w-[140px]">
              <span className="text-5xl font-bold text-gold">
                {averageRating.toFixed(1)}
              </span>
              <StarDisplay rating={averageRating} size={20} />
              <span className="text-sm text-muted">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Distribution */}
            <div className="flex-1 space-y-2">
              {distribution.map(({ stars, count }) => (
                <RatingBar
                  key={stars}
                  stars={stars}
                  count={count}
                  total={totalReviews}
                />
              ))}
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                    {review.userName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span className="font-semibold text-white text-sm">
                        {review.userName}
                      </span>
                      <StarDisplay rating={review.rating} size={14} />
                      <span className="text-xs text-muted">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-muted leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm p-10 text-center">
          <p className="text-muted">No reviews yet. Be the first to review!</p>
        </div>
      )}

      {/* Write a Review CTA */}
      {hasPurchased && (
        <div className="flex justify-center">
          <Button variant="outline" size="lg">
            Write a Review
          </Button>
        </div>
      )}
    </div>
  );
}
