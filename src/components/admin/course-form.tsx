"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  X,
} from "lucide-react";

interface LessonData {
  id?: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface CourseData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  price: number;
  mrp: number;
  category: string;
  difficulty: string;
  thumbnail: string;
  previewVideoUrl?: string | null;
  instructorName?: string;
  instructorBio?: string | null;
  techTags: string[];
  isPublished: boolean;
  isBestseller: boolean;
  lessons?: LessonData[];
}

interface CourseFormProps {
  course?: CourseData;
}

const categoryOptions = [
  { value: "web", label: "Web Development" },
  { value: "mobile", label: "Mobile Development" },
  { value: "ai", label: "AI / ML" },
  { value: "devops", label: "DevOps" },
  { value: "dsa", label: "DSA" },
  { value: "backend", label: "Backend" },
  { value: "frontend", label: "Frontend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "other", label: "Other" },
];

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const isEdit = !!course?.id;
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<LessonData[]>(
    course?.lessons ?? []
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(course?.techTags ?? []);

  // New lesson form state
  const [newLesson, setNewLesson] = useState<Omit<LessonData, "order">>({
    title: "",
    videoUrl: "",
    duration: 0,
    isFree: false,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: course?.title ?? "",
      slug: course?.slug ?? "",
      description: course?.description ?? "",
      shortDesc: course?.shortDesc ?? "",
      price: course?.price ?? 0,
      mrp: course?.mrp ?? 0,
      category: course?.category ?? "",
      difficulty: course?.difficulty ?? "",
      thumbnail: course?.thumbnail ?? "",
      previewVideoUrl: course?.previewVideoUrl ?? "",
      instructorName: course?.instructorName ?? "Code Hunters Team",
      instructorBio: course?.instructorBio ?? "",
      isPublished: course?.isPublished ?? false,
      isBestseller: course?.isBestseller ?? false,
    },
  });

  const title = watch("title");

  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addLesson = () => {
    if (!newLesson.title || !newLesson.videoUrl) {
      toast.error("Lesson title and video URL are required");
      return;
    }
    setLessons([
      ...lessons,
      { ...newLesson, order: lessons.length },
    ]);
    setNewLesson({ title: "", videoUrl: "", duration: 0, isFree: false });
  };

  const removeLesson = (idx: number) => {
    setLessons(
      lessons
        .filter((_, i) => i !== idx)
        .map((l, i) => ({ ...l, order: i }))
    );
  };

  const moveLesson = (idx: number, dir: "up" | "down") => {
    const arr = [...lessons];
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setLessons(arr.map((l, i) => ({ ...l, order: i })));
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const body = {
        ...data,
        price: Number(data.price),
        mrp: Number(data.mrp),
        techTags: tags,
        lessons: lessons.map((l) => ({
          ...(l.id ? { id: l.id } : {}),
          title: l.title,
          videoUrl: l.videoUrl,
          duration: l.duration,
          order: l.order,
          isFree: l.isFree,
        })),
      };

      const url = isEdit
        ? `/api/admin/courses/${course!.id}`
        : "/api/admin/courses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save course");
      }

      toast.success(isEdit ? "Course updated!" : "Course created!");
      router.push("/admin/courses");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Basic Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">Title</label>
            <Input
              {...register("title", { required: "Title is required" })}
              placeholder="Course title"
              error={errors.title?.message}
              onBlur={() => {
                if (!watch("slug")) generateSlug();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">Slug</label>
            <div className="flex gap-2">
              <Input
                {...register("slug", { required: "Slug is required" })}
                placeholder="course-slug"
                error={errors.slug?.message}
              />
              <Button type="button" variant="secondary" onClick={generateSlug}>
                Auto
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">
            Short Description
          </label>
          <Input
            {...register("shortDesc")}
            placeholder="Brief one-liner"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">
            Full Description
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            rows={5}
            className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background transition-all duration-200"
            placeholder="Detailed course description..."
          />
          {errors.description && (
            <p className="text-xs text-error">{errors.description.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              Price (₹)
            </label>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="499"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              MRP (₹)
            </label>
            <Input
              type="number"
              {...register("mrp", { valueAsNumber: true })}
              placeholder="999"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">Category</label>
            <Select
              {...register("category", { required: "Category is required" })}
              options={categoryOptions}
              placeholder="Select category"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              Difficulty
            </label>
            <Select
              {...register("difficulty", {
                required: "Difficulty is required",
              })}
              options={difficultyOptions}
              placeholder="Select difficulty"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              Thumbnail URL
            </label>
            <Input
              {...register("thumbnail", { required: "Thumbnail is required" })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              Preview Video URL
            </label>
            <Input
              {...register("previewVideoUrl")}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Tech tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Tech Stack</label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-2">
          <Checkbox
            {...register("isPublished")}
            label="Published"
          />
          <Checkbox
            {...register("isBestseller")}
            label="Bestseller"
          />
        </div>
      </div>

      {/* Lessons */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Lessons</h2>

        {lessons.length > 0 && (
          <div className="space-y-2">
            {lessons.map((lesson, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
              >
                <GripVertical className="h-4 w-4 text-muted flex-shrink-0" />
                <span className="text-xs font-medium text-muted w-6">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {lesson.videoUrl} • {lesson.duration}min
                  </p>
                </div>
                {lesson.isFree && <Badge variant="secondary">Free</Badge>}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => moveLesson(idx, "up")}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === lessons.length - 1}
                    onClick={() => moveLesson(idx, "down")}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-error hover:text-error"
                    onClick={() => removeLesson(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add lesson */}
        <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
          <p className="text-sm font-medium text-muted">Add New Lesson</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Lesson title"
              value={newLesson.title}
              onChange={(e) =>
                setNewLesson({ ...newLesson, title: e.target.value })
              }
            />
            <Input
              placeholder="Video URL"
              value={newLesson.videoUrl}
              onChange={(e) =>
                setNewLesson({ ...newLesson, videoUrl: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <Input
                type="number"
                placeholder="Minutes"
                value={newLesson.duration || ""}
                onChange={(e) =>
                  setNewLesson({
                    ...newLesson,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <Checkbox
              checked={newLesson.isFree}
              onChange={(e) =>
                setNewLesson({
                  ...newLesson,
                  isFree: (e.target as HTMLInputElement).checked,
                })
              }
              label="Free preview"
            />
            <Button type="button" variant="secondary" onClick={addLesson}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/courses")}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
