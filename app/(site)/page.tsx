import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productInclude, publicProductWhere } from "@/lib/product-query";
import { formatINR } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { ProductCard } from "@/components/product-card";
import { SmartImage } from "@/components/smart-image";
import { WishlistButton } from "@/components/wishlist-button";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [
    categories,
    featured,
    recent,
    popular,
    wishlist,
    productCount,
    userCount,
    bookingCount,
  ] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: { where: { status: "APPROVED", isAvailable: true } },
          },
        },
      },
    }),
    db.product.findMany({
      where: { ...publicProductWhere, isFeatured: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.product.findMany({
      where: publicProductWhere,
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.product.findMany({
      where: publicProductWhere,
      include: productInclude,
      orderBy: { views: "desc" },
      take: 4,
    }),
    user
      ? db.wishlist.findMany({
          where: { userId: user.id },
          select: { productId: true },
        })
      : Promise.resolve([]),
    db.product.count({ where: { status: "APPROVED" } }),
    db.user.count(),
    db.booking.count(),
  ]);

  const wishlistIds = new Set(wishlist.map((item) => item.productId));
  const heroProducts = (featured.length >= 3 ? featured : recent).slice(0, 3);
  const loggedIn = Boolean(user);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 surface-grid opacity-60" />
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-brand-200/40 blur-[120px]" />
        <div className="absolute -right-24 top-20 h-[360px] w-[360px] rounded-full bg-cyan-200/30 blur-[120px]" />

        <div className="page-shell relative grid gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
              </span>
              India&apos;s smarter rental marketplace
            </div>

            <h1 className="mt-6 font-display text-[3.3rem] font-semibold leading-[0.98] tracking-[-0.055em] text-ink sm:text-[4.2rem] lg:text-[4.8rem]">
              Don&apos;t buy it.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-brand-700 via-brand-500 to-cyan-500 bg-clip-text text-transparent">
                  Rent it.
                </span>
                <svg
                  className="absolute -bottom-2 left-0 z-0 w-full text-brand-200"
                  viewBox="0 0 300 20"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M4 15C60 4 150 3 296 10"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              Cameras, consoles, furniture, bikes and more — rent from people
              near you for a day, a week or a year. Skip the price tag, keep the
              experience.
            </p>

            <form action="/products" className="mt-7 max-w-xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-24px_rgba(21,19,31,0.28)] sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="q"
                    placeholder="What do you want to rent?"
                    className="h-11 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm text-ink outline-none placeholder:text-slate-400"
                  />
                </div>
                <select
                  name="category"
                  className="h-11 rounded-xl border-0 bg-slate-50 px-3 text-xs font-medium text-slate-600 outline-none sm:w-36"
                  defaultValue=""
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-primary h-11 sm:px-6">
                  Explore
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Popular:</span>
              {["Sony A7 III", "PlayStation 5", "MacBook Pro", "Royal Enfield"].map(
                (tag) => (
                  <Link
                    key={tag}
                    href={`/products?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 font-medium transition hover:border-brand-200 hover:text-brand-700"
                  >
                    {tag}
                  </Link>
                ),
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Verified renters
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <PackageCheck className="h-4 w-4 text-brand-500" />
                {productCount}+ live listings
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <Users className="h-4 w-4 text-sky-500" />
                {userCount} community members
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px] animate-fade-up delay-200 lg:mx-0">
            <div className="absolute inset-x-8 bottom-0 top-12 rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-900 opacity-10 blur-2xl" />

            <div className="relative grid grid-cols-2 gap-3">
              <div className="col-span-2 relative aspect-[16/10] overflow-hidden rounded-[1.75rem] border-4 border-white bg-slate-100 shadow-[0_30px_70px_-25px_rgba(6,95,70,0.42)]">
                {heroProducts[0] && (
                  <>
                    <SmartImage
                      src={heroProducts[0].images[0]}
                      alt={heroProducts[0].title}
                      sizes="(max-width: 768px) 100vw, 500px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                      <div>
                        <span className="badge bg-white/90 text-brand-700 backdrop-blur">
                          Featured today
                        </span>
                        <p className="mt-1.5 line-clamp-1 font-display text-sm font-semibold text-white">
                          {heroProducts[0].title}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/95 px-3 py-2 text-right backdrop-blur">
                        <p className="font-display text-sm font-bold text-ink">
                          {formatINR(heroProducts[0].dailyPrice)}
                        </p>
                        <p className="text-[9px] text-muted">per day</p>
                      </div>
                    </div>
                  </>
                )}
                <WishlistButton
                  productId={heroProducts[0]?.id ?? ""}
                  initial={wishlistIds.has(heroProducts[0]?.id ?? "")}
                  loggedIn={loggedIn}
                  className="absolute right-3 top-3"
                />
              </div>

              {heroProducts.slice(1, 3).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border-4 border-white bg-slate-100 shadow-[0_18px_40px_-20px_rgba(21,19,31,0.35)]"
                >
                  <SmartImage
                    src={product.images[0]}
                    alt={product.title}
                    sizes="260px"
                    className="transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-3 bottom-3">
                    <p className="line-clamp-1 text-[11px] font-semibold text-white">
                      {product.title}
                    </p>
                    <p className="text-[10px] text-white/70">
                      {formatINR(product.dailyPrice)} / day
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="absolute -left-4 top-1/3 rounded-2xl border border-white bg-white/95 p-3 shadow-xl backdrop-blur sm:-left-8">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CalendarCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    Bookings completed
                  </p>
                  <p className="font-display text-sm font-bold text-ink">
                    {bookingCount * 12 + 180}+
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 bottom-14 rounded-2xl border border-white bg-white/95 p-3 shadow-xl backdrop-blur sm:-right-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-3 w-3 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px] font-semibold text-ink">
                4.9 average rating
              </p>
              <p className="text-[9px] text-muted">from verified renters</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell relative -mt-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 10).map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative mb-3 aspect-[5/3] overflow-hidden rounded-xl bg-slate-100">
                <SmartImage
                  src={category.image}
                  alt={category.name}
                  sizes="220px"
                  className="transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-brand-700 backdrop-blur">
                  <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">
                    {category.name}
                  </p>
                  <p className="text-[10px] text-muted">
                    {category._count.products} items
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Handpicked for you</p>
            <h2 className="section-title mt-1.5">Featured rentals</h2>
            <p className="mt-1.5 text-sm text-muted">
              Popular picks from trusted owners across India.
            </p>
          </div>
          <Link href="/products?sort=popular" className="btn-secondary btn-sm">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              loggedIn={loggedIn}
              wishlisted={wishlistIds.has(product.id)}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="page-shell mt-24 scroll-mt-32"
      >
        <div className="relative overflow-hidden rounded-[2.25rem] bg-ink px-6 py-12 text-white sm:px-10 lg:px-14">
          <div className="absolute inset-0 surface-grid opacity-20" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/40 blur-[90px]" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/20 blur-[90px]" />

          <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.6fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                Simple by design
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                How KirayePe works
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
                Three steps between you and the thing you need. No hidden
                charges, no long-term commitment.
              </p>
              <Link
                href="/products"
                className="btn-primary mt-6"
              >
                Start exploring <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  step: "01",
                  title: "Discover",
                  text: "Browse verified listings near you and pick the perfect rental period.",
                },
                {
                  icon: CalendarCheck,
                  step: "02",
                  title: "Book",
                  text: "Choose dates, review transparent pricing and place a demo booking.",
                },
                {
                  icon: CheckCircle2,
                  step: "03",
                  title: "Enjoy",
                  text: "Meet the owner, collect your item and return it when you're done.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition hover:border-brand-400/40 hover:bg-white/[0.09]"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/20 text-brand-200">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-xs font-semibold text-white/25">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/50">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Fresh on KirayePe</p>
            <h2 className="section-title mt-1.5">Recently added</h2>
          </div>
          <Link href="/products?sort=newest" className="btn-ghost btn-sm">
            See newest <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              loggedIn={loggedIn}
              wishlisted={wishlistIds.has(product.id)}
            />
          ))}
        </div>
      </section>

      <section className="page-shell mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Loved by the community</p>
            <h2 className="section-title mt-1.5">Popular this week</h2>
          </div>
          <Link href="/products?sort=popular" className="btn-ghost btn-sm">
            View trending <TrendingUp className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              loggedIn={loggedIn}
              wishlisted={wishlistIds.has(product.id)}
            />
          ))}
        </div>
      </section>

      <section
        id="become-a-seller"
        className="page-shell mt-24 scroll-mt-32"
      >
        <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-brand-700 via-brand-600 to-cyan-600 px-6 py-12 text-white sm:px-10 lg:px-14">
          <div className="absolute inset-0 surface-grid opacity-20" />
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/15" />
          <div className="absolute -bottom-28 right-16 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Become a seller
              </div>
              <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                That camera in your cupboard could be earning.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
                List your gear, set your own prices and choose when it&apos;s
                available. KirayePe handles discovery, bookings and messages.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/dashboard/listings/new" className="btn bg-white text-brand-700 hover:bg-brand-50">
                  List an item <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products"
                  className="btn border border-white/25 bg-white/10 text-white hover:bg-white/15"
                >
                  Browse examples
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { icon: IndianRupee, text: "Set daily to yearly prices" },
                { icon: BadgeCheck, text: "Verified renters and deposits" },
                { icon: Users, text: "Direct chat with every customer" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="page-shell mt-24 scroll-mt-32">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Security deposits",
              text: "Every rental shows a refundable deposit up front, so owners and renters know what to expect.",
            },
            {
              icon: Camera,
              title: "Real listings, real people",
              text: "Products come with photos, condition notes and seller profiles. No stock-photo guesswork.",
            },
            {
              icon: CheckCircle2,
              title: "Demo-safe checkout",
              text: "Payments are simulated for this college project — book freely without entering card details.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}