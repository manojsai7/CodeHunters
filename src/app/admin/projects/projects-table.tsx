"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/admin/data-table";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  category: string;
  difficulty: string;
  price: number;
  mrp: number;
  isPublished: boolean;
  isBestseller: boolean;
  purchasesCount: number;
  createdAt: string;
}

export function ProjectsTable({ data }: { data: ProjectRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const togglePublish = async (id: string, current: boolean) => {
    setLoading(id);
    try {
      await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });
      router.refresh();
    } catch {
      //
    } finally {
      setLoading(null);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoading(id);
    try {
      await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      //
    } finally {
      setLoading(null);
    }
  };

  const columns: Column<ProjectRow>[] = [
    {
      key: "thumbnail",
      label: "Image",
      className: "w-16",
      render: (row) => (
        <div className="h-10 w-16 overflow-hidden rounded-md bg-surface-hover">
          {row.thumbnail && (
            <img
              src={row.thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (row) => (
        <p className="font-medium text-white truncate max-w-[200px]">
          {row.title}
        </p>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.category}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-white">{formatPrice(row.price)}</p>
          {row.mrp > row.price && (
            <p className="text-xs text-muted line-through">
              {formatPrice(row.mrp)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "purchasesCount",
      label: "Downloads",
      sortable: true,
      render: (row) => (
        <span className="text-muted">{row.purchasesCount}</span>
      ),
    },
    {
      key: "isPublished",
      label: "Status",
      render: (row) => (
        <Badge variant={row.isPublished ? "success" : "outline"}>
          {row.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/projects/${row.id}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={loading === row.id}
            onClick={() => togglePublish(row.id, row.isPublished)}
          >
            {row.isPublished ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-error hover:text-error"
            disabled={loading === row.id}
            onClick={() => deleteProject(row.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="title"
      searchPlaceholder="Search projects..."
      pageSize={10}
      emptyMessage="No projects found"
    />
  );
}
