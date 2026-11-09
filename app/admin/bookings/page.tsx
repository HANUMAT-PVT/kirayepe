import Link from "next/link";
import { CalendarCheck, IndianRupee, Receipt } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { BOOKING_STATUS_STYLES, DURATION_LABELS } from "@/lib/constants";
import { formatDate, formatINR, formatShortDate } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { SmartImage } from "@/components/smart-image";
import { EmptyState } from "@/components/empty-state";
import { AdminSearch } from "@/components/admin/admin-search";
import { BookingStatusSelect } from "@/components/admin/booking-status-select";

export const metadata = { title: "Booking management" };

const tabs = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";

  const where: Prisma.BookingWhereInput = {
    ...(q
      ? {
          OR: [
            { product: { is: { title: { contains: q } } } },
            { renter: { is: { name: { contains: q } } } },
            { seller: { is: { name: { contains: q } } } },
            { demoPaymentRef: { contains: q } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const [bookings, counts, gmv] = await Promise.all([
    db.booking.findMany({
      where,
      include: {
        product: { select: { id: true, title: true, images: true, city: true } },
        renter: { select: { id: true, name: true, avatar: true, email: true } },
        seller: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    db.booking.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true, rentalAmount: true, securityDeposit: true },
    }),
  ]);

  const countMap = new Map(counts.map((item) => [item.status, item._count._all]));
  const total = counts.reduce((sum, item) => sum + item._count._all, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Booking management</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Bookings
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {total} bookings · {formatINR(gmv._sum.totalAmount ?? 0)} demo GMV
          </p>
        </div>
        <AdminSearch placeholder="Search product, renter, payment ref…" defaultValue={q} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Demo GMV",
            value: formatINR(gmv._sum.totalAmount ?? 0, true),
            icon: IndianRupee,
          },
          {
            label: "Rental revenue",
            value: formatINR(gmv._sum.rentalAmount ?? 0, true),
            icon: Receipt,
          },
          {
            label: "Deposits held",
            value: formatINR(gmv._sum.securityDeposit ?? 0, true),
            icon: CalendarCheck,
          },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <stat.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className="font-display text-lg font-semibold text-ink">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const count = tab.value ? (countMap.get(tab.value) ?? 0) : total;
          return (
            <Link
              key={tab.value || "ALL"}
              href={
                tab.value
                  ? `/admin/bookings?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                  : `/admin/bookings${q ? `?q=${encodeURIComponent(q)}` : ""}`
              }
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                status === tab.value
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-brand-200 hover:text-brand-700"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-[10px] ${
                  status === tab.value ? "text-white/70" : "text-slate-400"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarCheck className="h-6 w-6" />}
            title="No bookings found"
            description="Try another status filter or search term."
          />
        </div>
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Booking</th>
                  <th className="px-4 py-3 font-semibold">Renter</th>
                  <th className="px-4 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold">Amounts</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="text-xs transition hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/${booking.product.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <SmartImage
                            src={booking.product.images[0]}
                            alt={booking.product.title}
                            sizes="90px"
                          />
                        </div>
                        <div className="min-w-0 max-w-[230px]">
                          <p className="truncate font-semibold text-ink hover:text-brand-700">
                            {booking.product.title}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {booking.product.city} ·{" "}
                            {DURATION_LABELS[booking.duration]} · {booking.days}d
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={booking.renter.name}
                          src={booking.renter.avatar}
                          size="xs"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${booking.renter.id}`}
                            className="block truncate text-[10px] font-medium text-slate-600 hover:text-brand-700"
                          >
                            {booking.renter.name}
                          </Link>
                          <p className="truncate text-[9px] text-slate-400">
                            seller: {booking.seller.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-500">
                      <p>
                        {formatShortDate(booking.startDate)} →{" "}
                        {formatShortDate(booking.endDate)}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        booked {formatDate(booking.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">
                        {formatINR(booking.totalAmount)}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        rent {formatINR(booking.rentalAmount)} · dep{" "}
                        {formatINR(booking.securityDeposit)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-slate-100 text-slate-600">
                        {booking.paymentStatus.replaceAll("_", " ")}
                      </span>
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="mt-0.5 block text-[8px] text-slate-400 hover:text-brand-700"
                      >
                        {booking.demoPaymentRef} →
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusSelect
                        bookingId={booking.id}
                        status={booking.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}