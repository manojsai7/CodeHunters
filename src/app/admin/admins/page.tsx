import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Admins — Code Hunters",
};

export default async function ManageAdminsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const me = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (me?.role !== "owner") redirect("/admin?error=owner_only");

  const admins = await prisma.profile.findMany({
    where: { role: { in: ["admin", "owner"] } },
    orderBy: { createdAt: "asc" },
    select: { userId: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Manage Admins</h1>
        <p className="mt-1 text-muted">Only the owner can view and manage this page.</p>
      </div>

      {/* Add / change role form */}
      <Card>
        <CardHeader>
          <CardTitle>Grant or Revoke Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/set-role" method="POST" className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              name="email"
              placeholder="user@email.com"
              required
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              name="role"
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="admin">Make Admin</option>
              <option value="student">Revoke (back to Student)</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/80"
            >
              Apply
            </button>
          </form>
          <p className="mt-3 text-xs text-muted">
            Note: To grant <strong>owner</strong> role, run SQL directly in Supabase — owner cannot be set via UI for security.
          </p>
        </CardContent>
      </Card>

      {/* Current admins table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Admins &amp; Owners ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Email", "Role", "Since"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admins.map((a) => (
                  <tr key={a.userId} className="hover:bg-surface-hover">
                    <td className="px-6 py-4 font-medium text-white">{a.name}</td>
                    <td className="px-6 py-4 text-muted">{a.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={a.role === "owner" ? "default" : "outline"}>
                        {a.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
