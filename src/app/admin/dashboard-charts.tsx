"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp, Target } from "lucide-react";

const COLORS = {
  primary: "#FF6B35",
  secondary: "#00D4FF",
  surface: "#1A1A2E",
  muted: "#A1A1AA",
  border: "#2A2A3E",
  gold: "#FFD700",
  success: "#22C55E",
};

interface Props {
  monthlyData: { month: string; revenue: number }[];
  topCourses: { title: string; revenue: number; purchases: number }[];
  conversionRate: number;
  totalLeads: number;
  totalCompleted: number;
}

export function AdminDashboardCharts({
  monthlyData,
  topCourses,
  conversionRate,
  totalLeads,
  totalCompleted,
}: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {/* Revenue chart */}
      <div className="xl:col-span-2 rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
        </div>
        <div className="h-72">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis
                  dataKey="month"
                  stroke={COLORS.muted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={COLORS.muted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    `₹${(v / 100).toLocaleString()}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) =>
                    `₹${(Number(value) / 100).toLocaleString()}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 5 }}
                  activeDot={{ fill: COLORS.primary, r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted text-sm">
              No revenue data yet
            </div>
          )}
        </div>
      </div>

      {/* Conversion rate */}
      <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
        <div className="mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-semibold text-white">Conversion Rate</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={COLORS.border}
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={COLORS.secondary}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${conversionRate * 2.64} ${264 - conversionRate * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {conversionRate}%
              </span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted">
              {totalCompleted} purchases from {totalLeads} leads
            </p>
          </div>
        </div>
      </div>

      {/* Top courses */}
      <div className="xl:col-span-3 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">
          Top Courses by Revenue
        </h2>
        <div className="h-64">
          {topCourses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCourses} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.border}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke={COLORS.muted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    `₹${(v / 100).toLocaleString()}`
                  }
                />
                <YAxis
                  dataKey="title"
                  type="category"
                  stroke={COLORS.muted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={200}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) =>
                    `₹${(Number(value) / 100).toLocaleString()}`
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill={COLORS.primary}
                  radius={[0, 6, 6, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted text-sm">
              No course data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
