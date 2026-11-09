import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  IndianRupee,
  Package,
  Pencil,
  PlusCircle,
  Store,
  TrendingUp,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  BOOKING_STATUS_STYLES,
  DURATION_LABELS,
  PRODUCT_STATUS_STYLES,
} from "@/lib/constants";
import { formatDate, formatINR, formatShortDate } from "@/lib/utils";
import { SmartImage } from "@/components/smart-image";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";
import { SellerBookingActions } from "@/components/dashboard/seller-booking-actions";

export const metadata = { title: "My listings" };

const tabs = ["", "APPROVED", "PENDING", "REJECTED"];

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const status = params.status ?? "";

  const [products, counts, incoming, earnings] = await Promise.all([
    db.product.findMany({
      where: { sellerId: user.id, ...(status ? { status } : {}) },
      include: {
        category: true,
        reviews: { select: { rating: true } },
        _count: { select: { bookings: true, wishlistedBy: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.groupBy({
      by: ["status"],
      where: { sellerId: user.id },
      _count: { _all: true },
    }),
    db.booking.findMany({
      where: {
        sellerId: user.id,
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      },
      include: {
        product: { select: { id: true, title: true, images: true } },
        renter: { select: { name: true, avatar: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.booking.aggregate({
      where: {
        sellerId: user.id,
        status: { in: ["COMPLETED", "ACTIVE", "CONFIRMED"] },
      },
      _sum: { rentalAmount: true },
    }),
  ]);

  const countMap = new Map(counts.map((item) => [item.status, item._count._all]));
  const totalCount = counts.reduce((sum, item) => sum + item._count._all, 0);
  const totalViews = products.reduce((sum, product) => sum + product.views, 0);
  const totalBookings = products.reduce(
    (sum, product) => sum + product._count.bookings,
    0,
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Seller hub</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            My listings
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Manage your products, pricing and incoming bookings.
          </p>
        </div>
        <Link href="/dashboard/listings/new" className="btn-primary btn-sm">
          <PlusCircle className="h-4 w-4" /> Add product
        </Link>
      </div>

      {params.saved && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Listing saved
            </p>
            <p className="text-xs text-emerald-700">
              Your changes were saved. New or edited listings are pending admin
              approval before appearing publicly.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total listings", value: totalCount, icon: Store },
          {
            label: "Live listings",
            value: countMap.get("APPROVED") ?? 0,
            icon: CheckCircle2,
          },
          { label: "Total views", value: totalViews, icon: Eye },
          {
            label: "Rental earnings",
            value: formatINR(earnings._sum.rentalAmount ?? 0),
            icon: TrendingUp,
          },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <stat.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className="font-display text-lg font-semibold text-ink">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {incoming.length > 0 && (
        <div className="card mt-5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Booking requests
              </h2>
              <p className="text-[11px] text-slate-400">
                {totalBookings} total bookings across your listings
              </p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {incoming.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"
              >
                <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <SmartImage
                    src={booking.product.images[0]}
                    alt={booking.product.title}
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {booking.product.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {booking.renter.name} · {formatShortDate(booking.startDate)} –{" "}
                    {formatShortDate(booking.endDate)} ·{" "}
                    {DURATION_LABELS[booking.duration]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={booking.status}
                    styles={BOOKING_STATUS_STYLES}
                  />
                  <span className="text-xs font-semibold text-ink">
                    {formatINR(booking.totalAmount)}
                  </span>
                  <SellerBookingActions
                    bookingId={booking.id}
                    status={booking.status}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const count = tab ? (countMap.get(tab) ?? 0) : totalCount;
          return (
            <Link
              key={tab || "ALL"}
              href={tab ? `/dashboard/listings?status=${tab}` : "/dashboard/listings"}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                status === tab
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-brand-200 hover:text-brand-700"
              }`}
            >
              {tab ? tab.charAt(0) + tab.slice(1).toLowerCase() : "All"}
              <span
                className={`ml-1.5 text-[10px] ${
                  status === tab ? "text-white/70" : "text-slate-400"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Store className="h-6 w-6" />}
            title="No listings here yet"
            description="Turn the things you already own into income. Add your first product in a couple of minutes."
            action={
              <Link href="/dashboard/listings/new" className="btn-primary btn-sm">
                <PlusCircle className="h-4 w-4" /> Add your first product
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={`/products/${product.id}`}
                  className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28"
                >
                  <SmartImage
                    src={product.images[0]}
                    alt={product.title}
                    sizes="160px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge
                      status={product.status}
                      styles={PRODUCT_STATUS_STYLES}
                    />
                    <span className="badge bg-slate-100 text-slate-500">
                      {product.category.name}
                    </span>
                    {product.isFeatured && (
                      <span className="badge bg-amber-50 text-amber-700">
                        Featured
                      </span>
                    )}
                    {!product.isAvailable && (
                      <span className="badge bg-rose-50 text-rose-600">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="mt-1.5 line-clamp-1 font-display text-sm font-semibold text-ink hover:text-brand-700"
                  >
                    {product.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formatINR(product.dailyPrice)} / day
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {product._count.bookings} bookings
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {product.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Listed {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                  <Link
                    href={`/dashboard/listings/${product.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                  <DeleteProductButton productId={product.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}