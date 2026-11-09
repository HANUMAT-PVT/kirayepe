import Link from "next/link";
import { SearchX, SlidersHorizontal } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productInclude, publicProductWhere } from "@/lib/product-query";
import { CONDITION_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { SortSelect } from "@/components/products/sort-select";

export const metadata = { title: "Explore rentals" };

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  city?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}>;

function buildQuery(
  base: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  const merged = { ...base, ...updates };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const categorySlug = params.category ?? "";
  const city = params.city ?? "";
  const condition = params.condition ?? "";
  const minPrice = Number(params.minPrice ?? 0) || 0;
  const maxPrice = Number(params.maxPrice ?? 0) || 0;
  const sort = params.sort ?? "newest";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const user = await getCurrentUser();

  const where: Prisma.ProductWhereInput = {
    ...publicProductWhere,
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { brand: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(city ? { city } : {}),
    ...(condition ? { condition } : {}),
    ...(minPrice > 0 || maxPrice > 0
      ? {
          dailyPrice: {
            ...(minPrice > 0 ? { gte: minPrice } : {}),
            ...(maxPrice > 0 ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { dailyPrice: "asc" }
      : sort === "price_desc"
        ? { dailyPrice: "desc" }
        : sort === "popular"
          ? { views: "desc" }
          : { createdAt: "desc" };

  const [products, total, categories, cityGroups, wishlist] = await Promise.all([
    db.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
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
    db.product.groupBy({
      by: ["city"],
      where: { status: "APPROVED", isAvailable: true },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
    }),
    user
      ? db.wishlist.findMany({
          where: { userId: user.id },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ]);

  const wishlistIds = new Set(wishlist.map((item) => item.productId));
  const activeCategory = categories.find((item) => item.slug === categorySlug);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = {
    q: q || undefined,
    category: categorySlug || undefined,
    city: city || undefined,
    condition: condition || undefined,
    minPrice: minPrice > 0 ? String(minPrice) : undefined,
    maxPrice: maxPrice > 0 ? String(maxPrice) : undefined,
    sort,
  };
  const hasFilters = Boolean(
    q || categorySlug || city || condition || minPrice || maxPrice,
  );

  const filterContent = (
    <form action="/products" className="space-y-6">
      {q && <input type="hidden" name="q" value={q} />}
      {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Category
        </h3>
        <div className="mt-3 space-y-1">
          <Link
            href={buildQuery(base, { category: undefined, page: undefined })}
            className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
              !categorySlug
                ? "bg-brand-50 font-semibold text-brand-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All categories <span className="text-[10px] text-slate-400">{await db.product.count({ where: { status: "APPROVED" } })}</span>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={buildQuery(base, {
                category: category.slug,
                page: undefined,
              })}
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                categorySlug === category.slug
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {category.name}
              <span className="text-[10px] text-slate-400">
                {category._count.products}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <label className="label" htmlFor="city">
          City
        </label>
        <select id="city" name="city" defaultValue={city} className="input">
          <option value="">Anywhere in India</option>
          {cityGroups.map((item) => (
            <option key={item.city} value={item.city}>
              {item.city} ({item._count._all})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="condition">
          Condition
        </label>
        <select
          id="condition"
          name="condition"
          defaultValue={condition}
          className="input"
        >
          <option value="">Any condition</option>
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="label">Daily price range</span>
        <div className="flex items-center gap-2">
          <input
            name="minPrice"
            type="number"
            min={0}
            defaultValue={minPrice || ""}
            placeholder="Min"
            className="input"
          />
          <span className="text-slate-300">–</span>
          <input
            name="maxPrice"
            type="number"
            min={0}
            defaultValue={maxPrice || ""}
            placeholder="Max"
            className="input"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            [0, 200],
            [200, 500],
            [500, 1000],
            [1000, 0],
          ].map(([min, max]) => {
            const label = max ? `${formatINR(min)}–${formatINR(max)}` : `${formatINR(min)}+`;
            const href = buildQuery(base, {
              minPrice: min > 0 ? String(min) : undefined,
              maxPrice: max > 0 ? String(max) : undefined,
              page: undefined,
            });
            return (
              <Link
                key={label}
                href={href}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 transition hover:border-brand-200 hover:text-brand-700"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 pt-5">
        <button type="submit" className="btn-primary btn-sm flex-1">
          Apply filters
        </button>
        <Link href="/products" className="btn-secondary btn-sm">
          Reset
        </Link>
      </div>
    </form>
  );

  return (
    <div className="page-shell py-10">
      <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-eyebrow">Explore the marketplace</p>
          <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {q
              ? `Results for “${q}”`
              : activeCategory
                ? activeCategory.name
                : "Rent something brilliant"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {activeCategory
              ? activeCategory.description
              : "Quality gear from verified owners. Rent by the day, week, month or year."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            {total} {total === 1 ? "rental" : "rentals"}
          </span>
          <SortSelect value={sort} />
        </div>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[245px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-600" />
              <h2 className="font-display text-sm font-semibold text-ink">
                Filters
              </h2>
            </div>
            {filterContent}
          </div>
        </aside>

        <div>
          <details className="mb-5 rounded-2xl border border-slate-200 bg-white lg:hidden">
            <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-ink">
              <SlidersHorizontal className="h-4 w-4 text-brand-600" />
              Filters & categories
            </summary>
            <div className="border-t border-slate-100 p-4">{filterContent}</div>
          </details>

          {hasFilters && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {q && (
                <span className="badge bg-brand-50 text-brand-700">“{q}”</span>
              )}
              {city && (
                <span className="badge bg-slate-100 text-slate-600">{city}</span>
              )}
              {condition && (
                <span className="badge bg-slate-100 text-slate-600">
                  {CONDITION_LABELS[condition]}
                </span>
              )}
              {(minPrice > 0 || maxPrice > 0) && (
                <span className="badge bg-slate-100 text-slate-600">
                  {minPrice > 0 ? formatINR(minPrice) : "₹0"} –{" "}
                  {maxPrice > 0 ? formatINR(maxPrice) : "Any"}
                </span>
              )}
              <Link href="/products" className="text-[11px] font-semibold text-brand-700">
                Clear all
              </Link>
            </div>
          )}

          {products.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No rentals matched your filters"
              description="Try a different category, city or price range. New listings are added every day."
              action={
                <Link href="/products" className="btn-primary btn-sm">
                  Clear filters
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    loggedIn={Boolean(user)}
                    wishlisted={wishlistIds.has(product.id)}
                    priority={index < 3}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-1.5">
                  {page > 1 && (
                    <Link
                      href={buildQuery(base, { page: String(page - 1) })}
                      className="btn-secondary btn-sm"
                    >
                      Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter(
                      (item) =>
                        item === 1 ||
                        item === totalPages ||
                        Math.abs(item - page) <= 1,
                    )
                    .map((item, index, list) => (
                      <span key={item} className="flex items-center gap-1.5">
                        {index > 0 && list[index - 1] !== item - 1 && (
                          <span className="px-1 text-slate-300">…</span>
                        )}
                        <Link
                          href={buildQuery(base, { page: String(item) })}
                          className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-semibold transition ${
                            item === page
                              ? "bg-brand-600 text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                          }`}
                        >
                          {item}
                        </Link>
                      </span>
                    ))}
                  {page < totalPages && (
                    <Link
                      href={buildQuery(base, { page: String(page + 1) })}
                      className="btn-secondary btn-sm"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}