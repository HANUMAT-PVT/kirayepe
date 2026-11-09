import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  IndianRupee,
  Package,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { BOOKING_STATUS_STYLES } from "@/lib/constants";
import { formatDate, formatINR, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import {
  BookingChart,
  CategoryChart,
  RevenueChart,
} from "@/components/admin/charts";
import { SmartImage } from "@/components/smart-image";

export const metadata = { title: "Admin overview" };

export default async function AdminPage() {
  await requireAdmin();

  const [
    totalUsers,
    totalProducts,
    totalBookings,
    activeRentals,
    pendingProducts,
    gmv,
    recentUsers,
    recentBookings,
    categoryGroups,
    bookingGroups,
    allBookings,
  ] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.booking.count(),
    db.booking.count({ where: { status: "ACTIVE" } }),
    db.product.count({ where: { status: "PENDING" } }),
    db.booking.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        city: true,
        role: true,
        createdAt: true,
        _count: { select: { products: true } },
      },
    }),
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      include: {
        product: { select: { id: true, title: true, images: true } },
        renter: { select: { name: true, avatar: true } },
      },
    }),
    db.product.groupBy({
      by: ["categoryId"],
      _count: { _all: true },
    }),
    db.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.booking.findMany({
      select: { totalAmount: true, createdAt: true },
      where: { status: { not: "CANCELLED" } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const categories = await db.category.findMany({
    select: { id: true, name: true },
  });
  const categoryNames = new Map(categories.map((item) => [item.id, item.name]));

  const categoryData = categoryGroups
    .map((group) => ({
      name: categoryNames.get(group.categoryId) ?? "Other",
      value: group._count._all,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const bookingData = bookingGroups.map((group) => ({
    status: group.status.charAt(0) + group.status.slice(1).toLowerCase(),
    count: group._count._all,
  }));

  const monthlyMap = new Map<string, { gmv: number; bookings: number }>();
  for (let index = 5; index >= 0; index--) {
    const date = new Date();
    date.setMonth(date.getMonth() - index, 1);
    const key = date.toLocaleDateString("en-IN", { month: "short" });
    monthlyMap.set(key, { gmv: 0, bookings: 0 });
  }
  for (const booking of allBookings) {
    const key = new Date(booking.createdAt).toLocaleDateString("en-IN", {
      month: "short",
    });
    if (monthlyMap.has(key)) {
      const current = monthlyMap.get(key)!;
      monthlyMap.set(key, {
        gmv: current.gmv + booking.totalAmount,
        bookings: current.bookings + 1,
      });
    }
  }
  const revenueData = Array.from(monthlyMap.entries()).map(([month, value]) => ({
    month,
    ...value,
  }));

  const stats = [
    {
      label: "Total users",
      value: totalUsers,
      change: "+12% this month",
      icon: Users,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Total products",
      value: totalProducts,
      change: `${pendingProducts} awaiting review`,
      icon: Package,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      label: "Total bookings",
      value: totalBookings,
      change: `${activeRentals} active rentals`,
      icon: CalendarCheck,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Demo GMV",
      value: formatINR(gmv._sum.totalAmount ?? 0, true),
      change: "Simulated payments only",
      icon: IndianRupee,
      tone: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Admin console</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Platform overview
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Live metrics from MongoDB · {formatDate(new Date())}
          </p>
        </div>
        <div className="flex gap-2">
          {pendingProducts > 0 && (
            <Link href="/admin/products?status=PENDING" className="btn-secondary btn-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Review {pendingProducts} listings
            </Link>
          )}
          <Link href="/admin/bookings" className="btn-primary btn-sm">
            Manage bookings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-300" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-ink">
              {stat.value}
            </p>
            <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-[10px] text-slate-400">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Demo GMV trend
              </h2>
              <p className="text-[11px] text-slate-400">
                Monthly simulated booking value
              </p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-3 w-3" /> Live data
            </span>
          </div>
          <div className="mt-3">
            <RevenueChart data={revenueData} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Category distribution
          </h2>
          <p className="text-[11px] text-slate-400">Products per category</p>
          <CategoryChart data={categoryData} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">
              Booking statistics
            </h2>
            <Link
              href="/admin/bookings"
              className="text-[11px] font-semibold text-brand-700"
            >
              View all →
            </Link>
          </div>
          <BookingChart data={bookingData} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">
              Recent bookings
            </h2>
            <Link
              href="/admin/bookings"
              className="text-[11px] font-semibold text-brand-700"
            >
              All bookings →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {recentBookings.map((booking) => (
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
                    {booking.renter.name} · {timeAgo(booking.createdAt)}
                  </p>
                </div>
                <span className="hidden text-[10px] font-semibold text-slate-600 sm:block">
                  {formatINR(booking.totalAmount)}
                </span>
                <StatusBadge status={booking.status} styles={BOOKING_STATUS_STYLES} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">
              Recent registrations
            </h2>
            <p className="text-[11px] text-slate-400">
              Newest members of the KirayePe community
            </p>
          </div>
          <Link href="/admin/users" className="text-[11px] font-semibold text-brand-700">
            Manage users →
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {recentUsers.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-ink">
                  {user.name}
                </p>
                <p className="truncate text-[9px] text-slate-400">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-medium text-slate-500">
                  {user._count.products} listings
                </p>
                <p className="text-[8px] text-slate-300">{timeAgo(user.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}