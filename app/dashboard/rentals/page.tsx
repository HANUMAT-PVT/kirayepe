import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Package,
  ReceiptText,
  Star,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BOOKING_STATUS_STYLES, DURATION_LABELS } from "@/lib/constants";
import { formatDate, formatINR } from "@/lib/utils";
import { SmartImage } from "@/components/smart-image";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CancelBookingButton } from "@/components/dashboard/cancel-booking-button";

export const metadata = { title: "My rentals" };

const tabs = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "CONFIRMED", label: "Upcoming" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; booked?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const status = params.status ?? "";

  const [bookings, counts] = await Promise.all([
    db.booking.findMany({
      where: {
        renterId: user.id,
        ...(status ? { status } : {}),
      },
      include: {
        product: {
          include: {
            category: true,
            seller: {
              select: { id: true, name: true, avatar: true, city: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.booking.groupBy({
      by: ["status"],
      where: { renterId: user.id },
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map(counts.map((item) => [item.status, item._count._all]));
  const totalCount = counts.reduce((sum, item) => sum + item._count._all, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Bookings</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            My rentals
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Track upcoming, active and completed rentals in one place.
          </p>
        </div>
        <Link href="/products" className="btn-secondary btn-sm">
          Rent something new <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {params.booked && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Demo booking confirmed
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Your simulated payment was successful. The seller has been
              notified and your rental is now in the list below.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const count = tab.value ? (countMap.get(tab.value) ?? 0) : totalCount;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/dashboard/rentals?status=${tab.value}` : "/dashboard/rentals"}
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
            icon={<Package className="h-6 w-6" />}
            title={status ? `No ${status.toLowerCase()} rentals` : "No rentals yet"}
            description="When you book a product, it will show up here with dates, payment reference and status."
            action={
              <Link href="/products" className="btn-primary btn-sm">
                Explore the marketplace
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-start gap-3.5">
                  <Link
                    href={`/products/${booking.productId}`}
                    className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-28 sm:w-36"
                  >
                    <SmartImage
                      src={booking.product.images[0]}
                      alt={booking.product.title}
                      sizes="200px"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge
                        status={booking.status}
                        styles={BOOKING_STATUS_STYLES}
                      />
                      <span className="badge bg-slate-100 text-slate-500">
                        {booking.paymentStatus.replaceAll("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {booking.demoPaymentRef}
                      </span>
                    </div>
                    <Link
                      href={`/products/${booking.productId}`}
                      className="mt-1.5 line-clamp-1 font-display text-sm font-semibold text-ink hover:text-brand-700"
                    >
                      {booking.product.title}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {booking.product.location}, {booking.product.city} ·{" "}
                      {booking.product.category.name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(booking.startDate)} –{" "}
                        {formatDate(booking.endDate)}
                      </span>
                      <span>
                        {DURATION_LABELS[booking.duration]} · {booking.days} days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-3 lg:w-[260px] lg:border-0 lg:pt-0">
                  <div className="lg:text-right">
                    <p className="text-[10px] text-slate-400">Total (demo)</p>
                    <p className="font-display text-lg font-semibold text-ink">
                      {formatINR(booking.totalAmount)}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      incl. {formatINR(booking.securityDeposit)} deposit
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Link
                      href={`/products/${booking.productId}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      View item
                    </Link>
                    {booking.status === "COMPLETED" && (
                      <Link
                        href={`/products/${booking.productId}#reviews`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-amber-600 transition hover:bg-amber-50"
                      >
                        <Star className="h-3 w-3" /> Review
                      </Link>
                    )}
                    {["PENDING", "CONFIRMED"].includes(booking.status) && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl bg-slate-50/70 px-3 py-2 text-[9px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ReceiptText className="h-3 w-3" /> Booked{" "}
                  {formatDate(booking.createdAt)}
                </span>
                <span>Rental {formatINR(booking.rentalAmount)}</span>
                <span>Fee {formatINR(booking.platformFee)}</span>
                <span>Deposit {formatINR(booking.securityDeposit)}</span>
                <span className="ml-auto">Seller: {booking.product.seller.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}