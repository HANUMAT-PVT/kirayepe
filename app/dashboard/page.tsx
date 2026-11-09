import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Heart,
  IndianRupee,
  MessageCircle,
  Package,
  PlusCircle,
  Sparkles,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BOOKING_STATUS_STYLES } from "@/lib/constants";
import {
  formatDate,
  formatINR,
  formatShortDate,
  timeAgo,
} from "@/lib/utils";
import { SmartImage } from "@/components/smart-image";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  const [
    activeRentals,
    upcomingRentals,
    listings,
    wishlistCount,
    unreadMessages,
    spent,
    earned,
    nextBooking,
    recentBookings,
    notifications,
    recentConversations,
  ] = await Promise.all([
    db.booking.count({ where: { renterId: user.id, status: "ACTIVE" } }),
    db.booking.count({
      where: { renterId: user.id, status: "CONFIRMED", startDate: { gte: now } },
    }),
    db.product.count({ where: { sellerId: user.id } }),
    db.wishlist.count({ where: { userId: user.id } }),
    db.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: {
          is: { OR: [{ customerId: user.id }, { sellerId: user.id }] },
        },
      },
    }),
    db.booking.aggregate({
      where: { renterId: user.id, status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    db.booking.aggregate({
      where: {
        sellerId: user.id,
        status: { in: ["COMPLETED", "ACTIVE", "CONFIRMED"] },
      },
      _sum: { rentalAmount: true },
    }),
    db.booking.findFirst({
      where: {
        renterId: user.id,
        status: { in: ["CONFIRMED", "ACTIVE"] },
        endDate: { gte: now },
      },
      include: { product: true },
      orderBy: { startDate: "asc" },
    }),
    db.booking.findMany({
      where: { renterId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.notification.findMany({
      where: { userId: user.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.conversation.findMany({
      where: { OR: [{ customerId: user.id }, { sellerId: user.id }] },
      include: {
        product: { select: { id: true, title: true, images: true } },
        customer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 3,
    }),
  ]);

  const profileFields = [user.phone, user.city, user.bio, user.avatar];
  const completion =
    Math.round(
      ((2 + profileFields.filter(Boolean).length) / (2 + profileFields.length)) * 100,
    ) || 0;

  const stats = [
    {
      label: "Active rentals",
      value: activeRentals,
      helper: `${upcomingRentals} upcoming`,
      icon: CalendarClock,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      label: "My listings",
      value: listings,
      helper: "Tap to manage",
      icon: Store,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Unread messages",
      value: unreadMessages,
      helper: "Reply to renters",
      icon: MessageCircle,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Wishlist saved",
      value: wishlistCount,
      helper: "Items you love",
      icon: Heart,
      tone: "bg-rose-50 text-rose-500",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">Your workspace</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Good to see you, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Here&apos;s what&apos;s happening with your rentals and listings.
          </p>
        </div>
        <Link href="/dashboard/listings/new" className="btn-primary btn-sm">
          <PlusCircle className="h-4 w-4" /> List a product
        </Link>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-300" />
            </div>
            <p className="mt-4 font-display text-3xl font-semibold text-ink">
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">{stat.helper}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total spent (demo)
            </p>
            <p className="font-display text-xl font-semibold text-ink">
              {formatINR(spent._sum.totalAmount ?? 0)}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Rental earnings
            </p>
            <p className="font-display text-xl font-semibold text-ink">
              {formatINR(earned._sum.rentalAmount ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {nextBooking ? (
        <div className="mt-5 overflow-hidden rounded-3xl bg-ink text-white">
          <div className="relative grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div className="absolute inset-0 surface-grid opacity-20" />
            <div className="relative flex items-center gap-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                <SmartImage
                  src={nextBooking.product.images[0]}
                  alt={nextBooking.product.title}
                  sizes="150px"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-300">
                  {nextBooking.status === "ACTIVE" ? "Rental in progress" : "Up next"}
                </p>
                <h2 className="mt-1 line-clamp-1 font-display text-lg font-semibold">
                  {nextBooking.product.title}
                </h2>
                <p className="mt-1 text-xs text-white/55">
                  {formatShortDate(nextBooking.startDate)} →{" "}
                  {formatShortDate(nextBooking.endDate)} · {nextBooking.days} days
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/rentals"
              className="btn relative bg-white text-ink hover:bg-brand-50"
            >
              Manage rental <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Nothing booked yet
              </p>
              <p className="text-xs text-slate-500">
                Find something you need for a few days instead of buying it.
              </p>
            </div>
          </div>
          <Link href="/products" className="btn-primary btn-sm">
            Explore rentals
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Recent bookings
              </h2>
              <p className="text-[11px] text-slate-400">
                Your latest rental activity
              </p>
            </div>
            <Link
              href="/dashboard/rentals"
              className="text-[11px] font-semibold text-brand-700"
            >
              View all →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<Package className="h-6 w-6" />}
                title="No bookings yet"
                description="Your first rental will appear here."
                action={
                  <Link href="/products" className="btn-primary btn-sm">
                    Browse products
                  </Link>
                }
                className="border-0 bg-transparent py-4"
              />
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/products/${booking.productId}`}
                  className="flex items-center gap-3 py-3 transition hover:bg-slate-50/60"
                >
                  <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
                      {formatShortDate(booking.startDate)} –{" "}
                      {formatShortDate(booking.endDate)} ·{" "}
                      {formatINR(booking.totalAmount)}
                    </p>
                  </div>
                  <StatusBadge
                    status={booking.status}
                    styles={BOOKING_STATUS_STYLES}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">
                Messages
              </h2>
              <Link
                href="/dashboard/messages"
                className="text-[11px] font-semibold text-brand-700"
              >
                Open inbox →
              </Link>
            </div>
            {recentConversations.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 px-3 py-4 text-center text-[11px] text-slate-400">
                No conversations yet. Message a seller from any product page.
              </p>
            ) : (
              <div className="mt-3 space-y-1">
                {recentConversations.map((conversation) => {
                  const other =
                    conversation.sellerId === user.id
                      ? conversation.customer
                      : conversation.seller;
                  const last = conversation.messages[0];
                  return (
                    <Link
                      key={conversation.id}
                      href={`/dashboard/messages?c=${conversation.id}`}
                      className="flex items-center gap-2.5 rounded-xl px-1.5 py-2 transition hover:bg-slate-50"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                        {other.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-ink">
                          {other.name}
                        </p>
                        <p className="truncate text-[10px] text-slate-400">
                          {last?.body ?? "Start the conversation"}
                        </p>
                      </div>
                      <span className="shrink-0 text-[9px] text-slate-300">
                        {last ? timeAgo(last.createdAt) : ""}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">
                Notifications
              </h2>
              <span className="badge bg-brand-50 text-brand-700">
                {notifications.length} new
              </span>
            </div>
            {notifications.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-4 text-[11px] text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                You&apos;re all caught up.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.href ?? "/dashboard"}
                    className="flex gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-ink">
                        {notification.title}
                      </p>
                      <p className="line-clamp-2 text-[10px] text-slate-400">
                        {notification.message}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Complete your profile
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">
            A complete profile builds trust with renters and owners.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="font-display text-sm font-semibold text-ink">
              {completion}%
            </span>
          </div>
          <Link
            href="/dashboard/profile"
            className="btn-secondary btn-sm mt-4 w-full"
          >
            Edit profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Quick actions
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              {
                href: "/dashboard/listings/new",
                label: "List a new product",
                icon: PlusCircle,
              },
              {
                href: "/dashboard/rentals",
                label: "Track my rentals",
                icon: Package,
              },
              {
                href: "/dashboard/messages",
                label: "Open messages",
                icon: MessageCircle,
              },
              {
                href: "/dashboard/wishlist",
                label: "View wishlist",
                icon: Heart,
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}