import { Star, Download, Calendar, BarChart3, Tag, Layers } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProjectStatsProps {
  purchasesCount: number;
  rating: number;
  reviewCount: number;
  difficulty: string;
  category: string;
  updatedAt: Date | string;
}

export function ProjectStats({
  purchasesCount,
  rating,
  reviewCount,
  difficulty,
  category,
  updatedAt,
}: ProjectStatsProps) {
  const stats = [
    {
      icon: Download,
      label: "Downloads",
      value: purchasesCount.toLocaleString(),
    },
    {
      icon: Star,
      label: "Rating",
      value: (
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          {rating.toFixed(1)}
          <span className="text-muted font-normal">({reviewCount})</span>
        </span>
      ),
    },
    {
      icon: Layers,
      label: "Difficulty",
      value: difficulty,
    },
    {
      icon: Tag,
      label: "Category",
      value: category,
    },
    {
      icon: Calendar,
      label: "Last Updated",
      value: formatDate(updatedAt),
    },
    {
      icon: BarChart3,
      label: "Popularity",
      value:
        purchasesCount >= 100
          ? "Hot"
          : purchasesCount >= 50
            ? "Popular"
            : "Rising",
    },
  ];

  return (
    <div className="space-y-3 text-sm">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted">
            <stat.icon className="h-4 w-4" />
            {stat.label}
          </span>
          <span className="font-medium text-white">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
