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
import { Save, X } from "lucide-react";

interface ProjectData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  price: number;
  mrp: number;
  zipUrl: string;
  thumbnail?: string | null;
  previewImages?: string[];
  techTags: string[];
  category: string;
  difficulty: string;
  isPublished: boolean;
  isBestseller: boolean;
}

interface ProjectFormProps {
  project?: ProjectData;
}

const categoryOptions = [
  { value: "web", label: "Web Development" },
  { value: "mobile", label: "Mobile App" },
  { value: "ai", label: "AI / ML" },
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "dashboard", label: "Dashboard" },
  { value: "landing", label: "Landing Page" },
  { value: "other", label: "Other" },
];

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!project?.id;
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(project?.techTags ?? []);
  const [imageInput, setImageInput] = useState("");
  const [previewImages, setPreviewImages] = useState<string[]>(
    project?.previewImages ?? []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      description: project?.description ?? "",
      shortDesc: project?.shortDesc ?? "",
      price: project?.price ?? 0,
      mrp: project?.mrp ?? 0,
      zipUrl: project?.zipUrl ?? "",
      thumbnail: project?.thumbnail ?? "",
      category: project?.category ?? "",
      difficulty: project?.difficulty ?? "",
      isPublished: project?.isPublished ?? false,
      isBestseller: project?.isBestseller ?? false,
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

  const addImage = () => {
    const url = imageInput.trim();
    if (url && !previewImages.includes(url)) {
      setPreviewImages([...previewImages, url]);
    }
    setImageInput("");
  };

  const removeImage = (url: string) => {
    setPreviewImages(previewImages.filter((u) => u !== url));
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const body = {
        ...data,
        price: Number(data.price),
        mrp: Number(data.mrp),
        techTags: tags,
        previewImages,
      };

      const url = isEdit
        ? `/api/admin/projects/${project!.id}`
        : "/api/admin/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save project");
      }

      toast.success(isEdit ? "Project updated!" : "Project created!");
      router.push("/admin/projects");
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
              placeholder="Project title"
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
                placeholder="project-slug"
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
          <Input {...register("shortDesc")} placeholder="Brief one-liner" />
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
            placeholder="Detailed project description..."
          />
          {errors.description && (
            <p className="text-xs text-error">{errors.description.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">Price (₹)</label>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="499"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">MRP (₹)</label>
            <Input
              type="number"
              {...register("mrp", { valueAsNumber: true })}
              placeholder="999"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">Category</label>
            <Select
              {...register("category", { required: "Required" })}
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
              {...register("difficulty", { required: "Required" })}
              options={difficultyOptions}
              placeholder="Select difficulty"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              Thumbnail URL
            </label>
            <Input
              {...register("thumbnail")}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              Download ZIP URL
            </label>
            <Input
              {...register("zipUrl", { required: "ZIP URL is required" })}
              placeholder="https://..."
              error={errors.zipUrl?.message}
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

        {/* Preview images */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">
            Preview Images
          </label>
          <div className="flex gap-2">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="Image URL..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addImage}>
              Add
            </Button>
          </div>
          {previewImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {previewImages.map((url) => (
                <div
                  key={url}
                  className="relative group rounded-lg overflow-hidden border border-border bg-surface-hover aspect-video"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-error/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-2">
          <Checkbox {...register("isPublished")} label="Published" />
          <Checkbox {...register("isBestseller")} label="Bestseller" />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/projects")}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
