import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { AdminSearch } from "@/components/admin/admin-search";
import { SuspendUserButton } from "@/components/admin/suspend-user-button";

export const metadata = { title: "User management" };

const roleTabs = [
  { value: "", label: "All" },
  { value: "USER", label: "Customers" },
  { value: "ADMIN", label: "Admins" },
  { value: "suspended", label: "Suspended" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const role = params.role ?? "";

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { city: { contains: q } },
          ],
        }
      : {}),
    ...(role === "suspended"
      ? { isSuspended: true }
      : role
        ? { role }
        : {}),
  };

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { products: true, bookings: true, sales: true } },
    },
  });

  const [total, suspended] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isSuspended: true } }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">User management</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Users
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {total} accounts · {suspended} suspended
          </p>
        </div>
        <AdminSearch placeholder="Search name, email, city…" defaultValue={q} />
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {roleTabs.map((tab) => (
          <Link
            key={tab.value || "ALL"}
            href={
              tab.value
                ? `/admin/users?role=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                : `/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`
            }
            className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
              role === tab.value
                ? "bg-brand-600 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:border-brand-200 hover:text-brand-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No users found"
            description="Try a different search term or clear the role filter."
          />
        </div>
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Listings</th>
                  <th className="px-4 py-3 font-semibold">Rentals</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="text-xs transition hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <Avatar name={user.name} src={user.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink hover:text-brand-700">
                            {user.name}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.city ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {user._count.products}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {user._count.bookings}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400">
                      {formatDate(user.createdAt)}
                      <span className="block text-[9px] text-slate-300">
                        {timeAgo(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isSuspended ? (
                        <span className="badge bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                          Suspended
                        </span>
                      ) : (
                        <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-lg px-2 py-1.5 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-50"
                        >
                          View
                        </Link>
                        {user.role !== "ADMIN" && (
                          <SuspendUserButton
                            userId={user.id}
                            suspended={user.isSuspended}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-[11px] text-brand-800">
        <UserPlus className="h-4 w-4" />
        Suspending an account blocks sign-in immediately, but keeps listings and
        booking history intact for the admin audit trail.
      </div>
    </div>
  );
}