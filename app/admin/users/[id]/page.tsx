import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldOff,
  Star,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { BOOKING_STATUS_STYLES, PRODUCT_STATUS_STYLES } from "@/lib/constants";
import { averageRating, formatDate, formatINR } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { SmartImage } from "@/components/smart-image";
import { SuspendUserButton } from "@/components/admin/suspend-user-button";

export const metadata = { title: "User details" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          category: true,
          _count: { select: { bookings: true, wishlistedBy: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      bookings: {
        include: { product: { select: { title: true, images: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
      reviewsReceived: { select: { rating: true, comment: true } },
      _count: {
        select: { products: true, bookings: true, sales: true, wishlist: true },
      },
    },
  });

  if (!user) notFound();

  const rating = averageRating(user.reviewsReceived);

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to users
      </Link>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="card overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-brand-700 via-brand-600 to-fuchsia-600" />
          <div className="-mt-8 px-5 pb-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Avatar
                name={user.name}
                src={user.avatar}
                size="xl"
                className="ring-4 ring-white"
              />
              <div className="mb-1 flex items-center gap-2">
                {user.isSuspended ? (
                  <span className="badge bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                    <ShieldOff className="h-3 w-3" /> Suspended
                  </span>
                ) : (
                  <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    Active
                  </span>
                )}
                <span className="badge bg-slate-100 text-slate-600">{user.role}</span>
                {user.role !== "ADMIN" && (
                  <SuspendUserButton userId={user.id} suspended={user.isSuspended} />
                )}
              </div>
            </div>

            <h1 className="mt-3 font-display text-xl font-semibold text-ink">
              {user.name}
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Joined {formatDate(user.createdAt)}
            </p>

            <div className="mt-4 grid gap-2 text-[11px] sm:grid-cols-2">
              <p className="flex items-center gap-1.5 text-slate-500">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {user.email}
              </p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {user.phone ?? "No phone saved"}
              </p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {user.city ?? "No city saved"}
              </p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                {rating > 0 ? `${rating.toFixed(1)} from ${user.reviewsReceived.length} reviews` : "No reviews yet"}
              </p>
            </div>

            {user.bio && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Listings", value: user._count.products, icon: Package },
            { label: "Rentals made", value: user._count.bookings, icon: CalendarDays },
            { label: "Sales", value: user._count.sales, icon: Package },
            { label: "Wishlist", value: user._count.wishlist, icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="card flex flex-col justify-between p-4">
              <stat.icon className="h-4 w-4 text-brand-600" />
              <div>
                <p className="font-display text-2xl font-semibold text-ink">
                  {stat.value}
                </p>
                <p className="text-[10px] text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Listed products ({user.products.length})
          </h2>
          {user.products.length === 0 ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-4 text-[11px] text-slate-400">
              This user has not listed any products.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {user.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:border-brand-200"
                >
                  <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <SmartImage
                      src={product.images[0]}
                      alt={product.title}
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-ink">
                      {product.title}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {product.category.name} · {formatINR(product.dailyPrice)}/day ·{" "}
                      {product._count.bookings} bookings
                    </p>
                  </div>
                  <StatusBadge
                    status={product.status}
                    styles={PRODUCT_STATUS_STYLES}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Recent bookings
          </h2>
          {user.bookings.length === 0 ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-4 text-[11px] text-slate-400">
              No rentals booked by this user yet.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {user.bookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-2.5 py-2.5">
                  <div className="relative h-9 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <SmartImage
                      src={booking.product.images[0]}
                      alt={booking.product.title}
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-ink">
                      {booking.product.title}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {formatDate(booking.startDate)} ·{" "}
                      {formatINR(booking.totalAmount)}
                    </p>
                  </div>
                  <StatusBadge
                    status={booking.status}
                    styles={BOOKING_STATUS_STYLES}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}