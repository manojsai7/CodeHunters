"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListVideo,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  isCompleted: boolean;
}

interface CoursePlayerClientProps {
  courseId: string;
  courseTitle: string;
  lessons: Lesson[];
  totalLessons: number;
}

export function CoursePlayerClient({
  courseId,
  courseTitle,
  lessons,
  totalLessons,
}: CoursePlayerClientProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Start at first incomplete lesson
    const idx = lessons.findIndex((l) => !l.isCompleted);
    return idx >= 0 ? idx : 0;
  });
  const [lessonStates, setLessonStates] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      lessons.forEach((l) => {
        map[l.id] = l.isCompleted;
      });
      return map;
    }
  );
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLesson = lessons[currentIndex];
  const completedCount = Object.values(lessonStates).filter(Boolean).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleMarkComplete = useCallback(async () => {
    if (!currentLesson || lessonStates[currentLesson.id]) return;
    setMarking(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          courseId,
          isCompleted: true,
        }),
      });
      if (res.ok) {
        setLessonStates((prev) => ({ ...prev, [currentLesson.id]: true }));
      }
    } catch {
      // Silently fail
    } finally {
      setMarking(false);
    }
  }, [currentLesson, courseId, lessonStates]);

  const goToLesson = (index: number) => {
    if (index >= 0 && index < lessons.length) {
      setCurrentIndex(index);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      {/* Top progress bar */}
      <div className="border-b border-border/50 bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold text-white sm:text-base">
              {courseTitle}
            </h1>
            <p className="text-xs text-muted">
              {completedCount} of {totalLessons} lessons completed •{" "}
              {progressPercent}%
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="ml-3 rounded-lg border border-border bg-surface p-2 text-muted hover:text-white lg:hidden"
          >
            <ListVideo className="h-5 w-5" />
          </button>
        </div>
        <div className="h-1 w-full bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content - Video + controls */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Video player */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-video w-full bg-black"
            >
              {currentLesson.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="mx-auto h-16 w-16 text-muted" />
                    <p className="mt-2 text-sm text-muted">
                      Video not available
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Lesson info + controls */}
          <div className="border-t border-border/50 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted">
                  Lesson {currentIndex + 1} of {totalLessons}
                </p>
                <h2 className="mt-1 text-lg font-bold text-white">
                  {currentLesson.title}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(currentLesson.duration)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => goToLesson(currentIndex - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {lessonStates[currentLesson.id] ? (
                  <Button variant="success" size="sm" disabled className="gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleMarkComplete}
                    disabled={marking}
                    className="gap-1"
                  >
                    {marking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Mark Complete
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === lessons.length - 1}
                  onClick={() => goToLesson(currentIndex + 1)}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop lesson sidebar */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-border/50 bg-surface/30 lg:flex">
          <div className="border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-bold text-white">Course Content</h3>
            <p className="text-xs text-muted">
              {completedCount}/{totalLessons} completed
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => goToLesson(idx)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border/30 px-4 py-3 text-left transition-colors",
                  idx === currentIndex
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-surface-hover"
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {lessonStates[lesson.id] ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : idx === currentIndex ? (
                    <PlayCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <span className="text-muted">{idx + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm",
                      idx === currentIndex
                        ? "font-semibold text-white"
                        : "text-muted"
                    )}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-xs text-muted/60">
                    {formatDuration(lesson.duration)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile lesson sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              />
              <motion.aside
                initial={{ x: 340 }}
                animate={{ x: 0 }}
                exit={{ x: 340 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 z-50 flex h-full w-[300px] flex-col border-l border-border/50 bg-surface lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                  <h3 className="text-sm font-bold text-white">
                    Course Content
                  </h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-1 text-muted hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {lessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => goToLesson(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border/30 px-4 py-3 text-left transition-colors",
                        idx === currentIndex
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-surface-hover"
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {lessonStates[lesson.id] ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : idx === currentIndex ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <span className="text-muted">{idx + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm",
                            idx === currentIndex
                              ? "font-semibold text-white"
                              : "text-muted"
                          )}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-muted/60">
                          {formatDuration(lesson.duration)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
