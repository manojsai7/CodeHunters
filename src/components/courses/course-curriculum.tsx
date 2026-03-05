"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock, PlayCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface CourseCurriculumProps {
  lessons: Lesson[];
  hasPurchased: boolean;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CourseCurriculum({
  lessons,
  hasPurchased,
}: CourseCurriculumProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalDuration = lessons.reduce((acc, l) => acc + l.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div>
          <h3 className="text-lg font-bold text-white">Course Curriculum</h3>
          <p className="text-sm text-muted mt-0.5">
            {lessons.length} lessons &middot; {durationStr} total
          </p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted" />
        </motion.div>
      </button>

      {/* Lessons */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5">
              {lessons.map((lesson) => {
                const canAccess = hasPurchased || lesson.isFree;
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 border-b border-white/5 px-5 py-3.5 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    {/* Order number */}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-muted">
                      {lesson.order}
                    </span>

                    {/* Icon */}
                    {canAccess ? (
                      <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Lock className="h-4 w-4 shrink-0 text-muted/50" />
                    )}

                    {/* Title */}
                    <span
                      className={`flex-1 text-sm ${
                        canAccess ? "text-white" : "text-muted"
                      }`}
                    >
                      {lesson.title}
                    </span>

                    {/* Free badge */}
                    {lesson.isFree && !hasPurchased && (
                      <Badge variant="success" className="text-[10px]">
                        Free
                      </Badge>
                    )}

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-xs text-muted shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatDuration(lesson.duration)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
