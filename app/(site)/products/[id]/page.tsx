import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CONDITION_LABELS, DURATION_LABELS } from "@/lib/constants";
import { averageRating, formatDate, formatINR, timeAgo } from "@/lib/utils";
import { SmartImage } from "@/components/smart-image";
import { Avatar } from "@/components/avatar";
import { Rating } from "@/components/rating";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductGallery } from "@/components/products/product-gallery";
import { BookingWidget } from "@/components/products/booking-widget";
import { ChatWithSeller } from "@/components/products/chat-with-seller";
import { ReviewForm } from "@/components/products/review-form";
import { ProductCard } from "@/components/product-card";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          city: true,
          bio: true,
          createdAt: true,
          isSuspended: true,
          reviewsReceived: { select: { rating: true } },
          _count: { select: { products: true } },
        },
      },
      reviews: {
        include: {
          author: { select: { id: true, name: true, avatar: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { bookings: true, wishlistedBy: true } },
    },
  });

  if (!product) notFound();

  const isOwner = user?.id === product.sellerId;
  const isAdmin = user?.role === "ADMIN";
  if (
    (product.status !== "APPROVED" || !product.isAvailable) &&
    !isOwner &&
    !isAdmin
  ) {
    notFound();
  }

  await db.product.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const [wishlistEntry, similar, eligibleBookings] = await Promise.all([
    user
      ? db.wishlist.findFirst({
          where: { userId: user.id, productId: id },
          select: { id: true },
        })
      : Promise.resolve(null),
    db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "APPROVED",
        isAvailable: true,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            createdAt: true,
            isSuspended: true,
          },
        },
        reviews: { select: { rating: true } },
        _count: { select: { bookings: true, wishlistedBy: true } },
      },
      orderBy: { views: "desc" },
      take: 4,
    }),
    user && !isOwner
      ? db.booking.count({
          where: {
            productId: id,
            renterId: user.id,
            status: { in: ["COMPLETED", "ACTIVE", "CONFIRMED"] },
          },
        })
      : Promise.resolve(0),
  ]);

  const alreadyReviewed = user
    ? product.reviews.some((review) => review.authorId === user.id)
    : false;
  const canReview = eligibleBookings > 0 && !alreadyReviewed;
  const productRating = averageRating(product.reviews);
  const sellerRating = averageRating(product.seller.reviewsReceived);

  const priceRows = [
    ["DAILY", product.dailyPrice],
    ["WEEKLY", product.weeklyPrice],
    ["MONTHLY", product.monthlyPrice],
    ["SIX_MONTH", product.sixMonthPrice],
    ["YEARLY", product.yearlyPrice],
  ] as const;

  return (
    <div className="page-shell py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-brand-700">
          Rentals
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-brand-700"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 max-w-[220px] text-slate-600">
          {product.title}
        </span>
      </nav>

      {product.status !== "APPROVED" && (isOwner || isAdmin) && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          This listing is <strong>{product.status.toLowerCase()}</strong> and is
          only visible to you{isAdmin ? " and admins" : ""}. It will appear
          publicly after admin approval.
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-brand-50 text-brand-700">
              {product.category.name}
            </span>
            <span className="badge bg-slate-100 text-slate-600">
              {CONDITION_LABELS[product.condition] ?? product.condition}
            </span>
            {product.isFeatured && (
              <span className="badge bg-amber-50 text-amber-700">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl lg:text-[2.4rem]">
            {product.title}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <Rating value={productRating} count={product.reviews.length} />
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {product.location}, {product.city}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {product.views + 1} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Listed {timeAgo(product.createdAt)}
            </span>
          </div>
        </div>
        <WishlistButton
          productId={product.id}
          initial={Boolean(wishlistEntry)}
          loggedIn={Boolean(user)}
          showLabel
          className="px-4 py-2.5"
        />
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1.6fr_0.75fr]">
        <div>
          <ProductGallery images={product.images} title={product.title} />

          <div className="mt-8 flex flex-wrap gap-2">
            {priceRows.map(([key, value]) => (
              <div
                key={key}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {DURATION_LABELS[key]}
                </p>
                <p className="mt-0.5 font-display text-sm font-semibold text-ink">
                  {formatINR(value)}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-ink">
              About this rental
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {product.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Tag,
                  label: "Brand",
                  value: product.brand,
                },
                {
                  icon: BadgeCheck,
                  label: "Condition",
                  value: CONDITION_LABELS[product.condition] ?? product.condition,
                },
                {
                  icon: ShieldCheck,
                  label: "Security deposit",
                  value: `${formatINR(product.securityDeposit)} refundable`,
                },
                {
                  icon: CalendarDays,
                  label: "Extra day",
                  value: `${formatINR(product.extraDayPrice)} beyond package`,
                },
                {
                  icon: Package,
                  label: "Availability",
                  value: product.isAvailable ? "Available now" : "Unavailable",
                },
                {
                  icon: MapPin,
                  label: "Pickup area",
                  value: `${product.location}, ${product.city}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-xs font-semibold text-ink">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-eyebrow">Meet the owner</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                  {product.seller.name}
                </h2>
              </div>
              <Link
                href={`/products?q=${encodeURIComponent(product.seller.name.split(" ")[0])}`}
                className="text-xs font-semibold text-brand-700"
              >
                View other listings →
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar
                name={product.seller.name}
                src={product.seller.avatar}
                size="xl"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <Rating value={sellerRating} />
                  <span>·</span>
                  <span>{product.seller._count.products} listings</span>
                  <span>·</span>
                  <span>Joined {formatDate(product.seller.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {product.seller.bio ??
                    "A verified KirayePe owner who loves sharing well-maintained gear with the community."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge bg-emerald-50 text-emerald-700">
                    <BadgeCheck className="h-3 w-3" /> Verified owner
                  </span>
                  <span className="badge bg-slate-100 text-slate-600">
                    <MapPin className="h-3 w-3" /> {product.seller.city ?? product.city}
                  </span>
                </div>
              </div>
              {!isOwner && (
                <ChatWithSeller
                  productId={product.id}
                  loggedIn={Boolean(user)}
                  className="sm:w-48"
                />
              )}
            </div>
          </section>

          <section id="reviews" className="mt-10 scroll-mt-32">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  Reviews
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < Math.round(productRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {productRating > 0 ? productRating.toFixed(1) : "New listing"}{" "}
                    · {product.reviews.length} reviews
                  </span>
                </div>
              </div>
              {canReview && <ReviewForm productId={product.id} />}
            </div>

            {product.reviews.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-muted">
                No reviews yet. Be the first to rent and share your experience.
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.reviews.slice(0, 6).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={review.author.name}
                        src={review.author.avatar}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink">
                          {review.author.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {review.author.city} · {timeAgo(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${
                              index < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div>
          <BookingWidget
            product={{
              dailyPrice: product.dailyPrice,
              weeklyPrice: product.weeklyPrice,
              monthlyPrice: product.monthlyPrice,
              sixMonthPrice: product.sixMonthPrice,
              yearlyPrice: product.yearlyPrice,
              extraDayPrice: product.extraDayPrice,
              securityDeposit: product.securityDeposit,
            }}
            productId={product.id}
            available={product.isAvailable && product.status === "APPROVED"}
            loggedIn={Boolean(user)}
            isOwner={isOwner}
          />

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> KirayePe
              promise
            </h3>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-500">
              <li>• Inspect the item at pickup before accepting it.</li>
              <li>• Security deposit is refunded after a clean return.</li>
              <li>• Chat with the owner for any questions or special requests.</li>
            </ul>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t border-slate-200/80 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">You may also like</p>
              <h2 className="section-title mt-1.5">Similar rentals</h2>
            </div>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="btn-secondary btn-sm"
            >
              View category
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                loggedIn={Boolean(user)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}