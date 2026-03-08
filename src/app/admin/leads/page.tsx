import { Metadata } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserPlus, GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Leads | Admin - Code Hunters",
};

export default async function AdminLeadsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  try {
  const searchParams = await searchParamsPromise;
  const search = searchParams.search || "";
  const db = createAdminSupabaseClient();

  let query = db
    .from("pre_checkout_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: leads } = await query;
  const allLeads = leads ?? [];

  // Check which leads converted (have a matching purchase by email)
  const leadEmails = allLeads.map((l: { email: string }) => l.email);
  // Get profiles that match lead emails, then check if they have completed purchases
  const { data: matchingProfiles } = await db
    .from("profiles")
    .select("email, user_id")
    .in("email", leadEmails.length > 0 ? leadEmails : ["__none__"]);

  const profileUserIds = (matchingProfiles ?? []).map((p: { user_id: string }) => p.user_id);
  const emailByUserId: Record<string, string> = {};
  for (const p of matchingProfiles ?? []) {
    emailByUserId[p.user_id] = p.email;
  }

  const { data: completedPurchases } = await db
    .from("purchases")
    .select("user_id")
    .eq("status", "completed")
    .in("user_id", profileUserIds.length > 0 ? profileUserIds : ["__none__"]);

  const convertedEmails = new Set(
    (completedPurchases ?? [])
      .filter((p: { user_id: string | null }) => p.user_id && emailByUserId[p.user_id])
      .map((p: { user_id: string }) => emailByUserId[p.user_id])
  );

  const { count: totalLeads } = await db
    .from("pre_checkout_leads")
    .select("*", { count: "exact", head: true });

  const studentLeads = allLeads.filter((l: { self_declared_student: boolean }) => l.self_declared_student).length;
  const convertedCount = allLeads.filter((l: { email: string }) => convertedEmails.has(l.email)).length;
  const total = totalLeads ?? 0;
  const conversionRate = total > 0 ? ((convertedCount / allLeads.length) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pre-Checkout Leads</h1>
          <p className="text-muted">{total} total leads collected</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface/30 border border-white/10 rounded-xl p-4">
          <p className="text-muted text-sm">Total Leads</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-surface/30 border border-white/10 rounded-xl p-4">
          <p className="text-muted text-sm">Student Leads</p>
          <p className="text-2xl font-bold text-secondary">{studentLeads}</p>
        </div>
        <div className="bg-surface/30 border border-white/10 rounded-xl p-4">
          <p className="text-muted text-sm">Converted</p>
          <p className="text-2xl font-bold text-green-400">{convertedCount}</p>
        </div>
        <div className="bg-surface/30 border border-white/10 rounded-xl p-4">
          <p className="text-muted text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
        </div>
      </div>

      {/* Search */}
      <form className="relative max-w-md">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-white/10 rounded-lg text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </form>

      {/* Table */}
      <div className="bg-surface/30 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted">Lead</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Phone</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">State</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Product</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Student</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {allLeads.map((lead: any) => (
                <tr
                  key={lead.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-sm text-muted">{lead.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted" />
                      {lead.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lead.state}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{lead.product_type}</Badge>
                    <p className="text-xs text-muted mt-1 truncate max-w-[120px]">
                      {lead.product_id}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {lead.self_declared_student ? (
                      <Badge variant="secondary">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Student
                      </Badge>
                    ) : (
                      <span className="text-muted text-sm">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {convertedEmails.has(lead.email) ? (
                      <Badge variant="success">Converted</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              ))}
              {allLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No leads collected yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-white">Unable to load leads</h2>
        <p className="mt-2 text-sm text-muted">Database connection unavailable. Please try again later.</p>
      </div>
    );
  }
}
