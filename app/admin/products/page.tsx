import Link from "next/link";
import { Package, Sparkles } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRODUCT_STATUS_STYLES } from "@/lib/constants";
import { formatDate, formatINR } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { SmartImage } from "@/components/smart-image";
import { EmptyState } from "@/components/empty-state";
import { AdminSearch } from "@/components/admin/admin-search";
import { ProductModerationActions } from "@/components/admin/product-moderation-actions";

export const metadata = { title: "Product management" };

const tabs = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "featured", label: "Featured" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { brand: { contains: q } },
            { city: { contains: q } },
            { seller: { is: { name: { contains: q } } } },
          ],
        }
      : {}),
    ...(status === "featured"
      ? { isFeatured: true }
      : status
        ? { status }
        : {}),
  };

  const [products, counts] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        seller: { select: { id: true, name: true, avatar: true } },
        _count: { select: { bookings: true, wishlistedBy: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap = new Map(counts.map((item) => [item.status, item._count._all]));
  const total = counts.reduce((sum, item) => sum + item._count._all, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Product management</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Listings
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {total} listings · {countMap.get("PENDING") ?? 0} awaiting review
          </p>
        </div>
        <AdminSearch placeholder="Search title, brand, seller, city…" defaultValue={q} />
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const count =
            tab.value === "featured"
              ? undefined
              : tab.value
                ? (countMap.get(tab.value) ?? 0)
                : total;
          return (
            <Link
              key={tab.value || "ALL"}
              href={
                tab.value
                  ? `/admin/products?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                  : `/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}`
              }
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                status === tab.value
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-brand-200 hover:text-brand-700"
              }`}
            >
              {tab.label}
              {typeof count === "number" && (
                <span
                  className={`ml-1.5 text-[10px] ${
                    status === tab.value ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="No listings in this view"
            description="Try a different status or search term."
          />
        </div>
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Seller</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stats</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="text-xs transition hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <SmartImage
                            src={product.images[0]}
                            alt={product.title}
                            sizes="90px"
                          />
                        </div>
                        <div className="min-w-0 max-w-[240px]">
                          <p className="truncate font-semibold text-ink hover:text-brand-700">
                            {product.title}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {product.category.name} · {product.city} ·{" "}
                            {formatDate(product.createdAt)}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={product.seller.name}
                          src={product.seller.avatar}
                          size="xs"
                        />
                        <Link
                          href={`/admin/users/${product.seller.id}`}
                          className="text-[10px] font-medium text-slate-600 hover:text-brand-700"
                        >
                          {product.seller.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">
                        {formatINR(product.dailyPrice)}
                      </p>
                      <p className="text-[9px] text-slate-400">per day</p>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-500">
                      <p>{product._count.bookings} bookings</p>
                      <p>{product.views} views</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge
                          status={product.status}
                          styles={PRODUCT_STATUS_STYLES}
                        />
                        {product.isFeatured && (
                          <span className="badge bg-amber-50 text-amber-700">
                            <Sparkles className="h-2.5 w-2.5" /> Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <ProductModerationActions
                          productId={product.id}
                          status={product.status}
                          featured={product.isFeatured}
                        />
                      </div>
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