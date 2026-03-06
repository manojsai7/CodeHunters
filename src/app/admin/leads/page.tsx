import { Metadata } from "next";
import prisma from "@/lib/prisma";
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

  const leads = await prisma.preCheckoutLead.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Check which leads converted (have a matching purchase by email)
  const leadEmails = leads.map((l) => l.email);
  const purchasedEmails = await prisma.purchase.findMany({
    where: {
      profile: { email: { in: leadEmails } },
      status: "completed",
    },
    select: { profile: { select: { email: true } } },
  });
  const convertedEmails = new Set(
    purchasedEmails
      .filter((p) => p.profile !== null)
      .map((p) => p.profile!.email)
  );

  const totalLeads = await prisma.preCheckoutLead.count();
  const studentLeads = leads.filter((l) => l.selfDeclaredStudent).length;
  const convertedCount = leads.filter((l) => convertedEmails.has(l.email)).length;
  const conversionRate = totalLeads > 0 ? ((convertedCount / leads.length) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pre-Checkout Leads</h1>
          <p className="text-muted">{totalLeads} total leads collected</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface/30 border border-white/10 rounded-xl p-4">
          <p className="text-muted text-sm">Total Leads</p>
          <p className="text-2xl font-bold text-white">{totalLeads}</p>
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
              {leads.map((lead) => (
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
                    <Badge variant="outline">{lead.productType}</Badge>
                    <p className="text-xs text-muted mt-1 truncate max-w-[120px]">
                      {lead.productId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {lead.selfDeclaredStudent ? (
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
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
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
