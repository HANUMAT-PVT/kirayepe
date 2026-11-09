import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck, User } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { BOOKING_STATUS_STYLES, DURATION_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, formatINR } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { SmartImage } from "@/components/smart-image";
import { BookingStatusSelect } from "@/components/admin/booking-status-select";

export const metadata = { title: "Booking details" };

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      product: { include: { category: true } },
      renter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          city: true,
          phone: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          city: true,
          phone: true,
        },
      },
    },
  });

  if (!booking) notFound();

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-eyebrow">Booking {booking.demoPaymentRef}</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">
            {booking.product.title}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Created {formatDateTime(booking.createdAt)}
          </p>
        </div>
        <BookingStatusSelect bookingId={booking.id} status={booking.status} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row">
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:w-40">
                <SmartImage
                  src={booking.product.images[0]}
                  alt={booking.product.title}
                  sizes="200px"
                />
              </div>
              <div className="flex-1">
                <span className="badge bg-brand-50 text-brand-700">
                  {booking.product.category.name}
                </span>
                <Link
                  href={`/products/${booking.product.id}`}
                  className="mt-2 block font-display text-base font-semibold text-ink hover:text-brand-700"
                >
                  {booking.product.title}
                </Link>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin className="h-3 w-3" /> {booking.product.location},{" "}
                  {booking.product.city}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[9px] uppercase text-slate-400">Starts</p>
                    <p className="text-[11px] font-semibold text-ink">
                      {formatDate(booking.startDate)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[9px] uppercase text-slate-400">Returns</p>
                    <p className="text-[11px] font-semibold text-ink">
                      {formatDate(booking.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Renter", person: booking.renter },
              { label: "Seller / owner", person: booking.seller },
            ].map((item) => (
              <div key={item.label} className="card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <Avatar name={item.person.name} src={item.person.avatar} size="md" />
                  <div className="min-w-0">
                    <Link
                      href={`/admin/users/${item.person.id}`}
                      className="truncate text-xs font-semibold text-ink hover:text-brand-700"
                    >
                      {item.person.name}
                    </Link>
                    <p className="truncate text-[10px] text-slate-400">
                      {item.person.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-[10px] text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <User className="h-3 w-3" /> {item.person.city ?? "No city"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    {item.person.phone ?? "No phone"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Payment breakdown
          </h2>
          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Duration</span>
              <span className="font-medium text-ink">
                {DURATION_LABELS[booking.duration]} · {booking.days} days
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Rental amount</span>
              <span className="font-medium text-ink">
                {formatINR(booking.rentalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Platform fee</span>
              <span className="font-medium text-ink">
                {formatINR(booking.platformFee)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Security deposit</span>
              <span className="font-medium text-ink">
                {formatINR(booking.securityDeposit)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-display text-xl font-semibold text-ink">
                {formatINR(booking.totalAmount)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-wide text-slate-400">
                Demo payment reference
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-600">
                {booking.demoPaymentRef}
              </p>
              <p className="mt-1 text-[9px] text-slate-400">
                Status: {booking.paymentStatus.replaceAll("_", " ")} · simulated
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 p-3 text-[10px] text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-brand-500" />
              Current status
              <StatusBadge
                status={booking.status}
                styles={BOOKING_STATUS_STYLES}
                className="ml-auto"
              />
            </div>
          </div>

          {booking.notes && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-[10px] text-amber-800">
              {booking.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}