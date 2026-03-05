"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable, Column } from "@/components/admin/data-table";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface CouponRow {
  id: string;
  code: string;
  discount: number;
  type: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  source: string;
  userName: string | null;
  createdAt: string;
}

export function CouponsClient({ data }: { data: CouponRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // New coupon form
  const [form, setForm] = useState({
    code: "",
    discount: 10,
    type: "percent",
    usageLimit: 100,
    expiresAt: "",
  });

  const toggleActive = async (id: string, current: boolean) => {
    setLoading(id);
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      router.refresh();
    } catch {
      //
    } finally {
      setLoading(null);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    setLoading(id);
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      //
    } finally {
      setLoading(null);
    }
  };

  const createCoupon = async () => {
    if (!form.code || !form.expiresAt) {
      toast.error("Code and expiry date are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create coupon");
      }
      toast.success("Coupon created!");
      setShowForm(false);
      setForm({ code: "", discount: 10, type: "percent", usageLimit: 100, expiresAt: "" });
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<CouponRow>[] = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-primary">{row.code}</span>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      sortable: true,
      render: (row) => (
        <span className="text-white font-medium">
          {row.discount}{row.type === "percent" ? "%" : " ₹"}
        </span>
      ),
    },
    {
      key: "usedCount",
      label: "Uses",
      render: (row) => (
        <span className="text-muted">
          {row.usedCount} / {row.usageLimit}
        </span>
      ),
    },
    {
      key: "expiresAt",
      label: "Expires",
      sortable: true,
      render: (row) => {
        const expired = new Date(row.expiresAt) < new Date();
        return (
          <span className={expired ? "text-error" : "text-muted"}>
            {formatDate(row.expiresAt)}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => {
        const expired = new Date(row.expiresAt) < new Date();
        if (expired) return <Badge variant="error">Expired</Badge>;
        return (
          <Badge variant={row.isActive ? "success" : "outline"}>
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      key: "source",
      label: "Source",
      render: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.source}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={loading === row.id}
            onClick={() => toggleActive(row.id, row.isActive)}
          >
            {row.isActive ? (
              <ToggleRight className="h-4 w-4 text-success" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-error hover:text-error"
            disabled={loading === row.id}
            onClick={() => deleteCoupon(row.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">New Coupon</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              placeholder="CODE"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
            />
            <Input
              type="number"
              placeholder="Discount"
              value={form.discount}
              onChange={(e) =>
                setForm({ ...form, discount: parseInt(e.target.value) || 0 })
              }
            />
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: "percent", label: "Percentage" },
                { value: "flat", label: "Flat (₹)" },
              ]}
            />
            <Input
              type="number"
              placeholder="Max uses"
              value={form.usageLimit}
              onChange={(e) =>
                setForm({ ...form, usageLimit: parseInt(e.target.value) || 1 })
              }
            />
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button onClick={createCoupon} isLoading={creating}>
              Create Coupon
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        searchKey="code"
        searchPlaceholder="Search by code..."
        pageSize={10}
        emptyMessage="No coupons found"
        actions={
          !showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Coupon
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
