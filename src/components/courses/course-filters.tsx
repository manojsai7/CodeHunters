"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES, DIFFICULTIES } from "@/utils/constants";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export function CourseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  const hasFilters = category || difficulty || search || sort;

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const resetFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface/50 backdrop-blur-md p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => updateParams("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category */}
        <Select
          value={category}
          onChange={(e) => updateParams("category", e.target.value)}
          placeholder="All Categories"
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />

        {/* Difficulty */}
        <Select
          value={difficulty}
          onChange={(e) => updateParams("difficulty", e.target.value)}
          placeholder="All Levels"
          options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
        />

        {/* Sort */}
        <Select
          value={sort}
          onChange={(e) => updateParams("sort", e.target.value)}
          placeholder="Sort By"
          options={SORT_OPTIONS.filter((o) => o.value !== "")}
        />

        {/* Reset */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="default"
            onClick={resetFilters}
            className="flex items-center gap-2 text-muted hover:text-white"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
