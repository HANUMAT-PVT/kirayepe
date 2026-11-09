import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { ProductWithMeta } from "@/lib/product-query";
import { CONDITION_LABELS } from "@/lib/constants";
import { averageRating, cn, formatINR } from "@/lib/utils";
import { SmartImage } from "./smart-image";
import { Rating } from "./rating";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({
  product,
  loggedIn = false,
  wishlisted = false,
  priority = false,
  className,
}: {
  product: ProductWithMeta;
  loggedIn?: boolean;
  wishlisted?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const rating = averageRating(product.reviews);

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/products/${product.id}`} className="block">
        <div className="card hover-lift overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <SmartImage
              src={product.images[0]}
              alt={product.title}
              priority={priority}
              className="transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {product.isFeatured && (
                <span className="badge bg-white/90 text-brand-700 shadow-sm backdrop-blur">
                  Featured
                </span>
              )}
              <span className="badge bg-ink/80 text-white backdrop-blur">
                {CONDITION_LABELS[product.condition] ?? product.condition}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <span className="badge bg-white/90 text-slate-700 shadow-sm backdrop-blur">
                {product.category.name}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                <MapPin className="h-2.5 w-2.5" /> {product.city}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-1 font-display text-[15px] font-semibold text-ink transition group-hover:text-brand-700">
                  {product.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {product.brand} · {product.seller.name.split(" ")[0]}
                </p>
              </div>
              <Rating value={rating} count={product.reviews.length} />
            </div>

            <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
              <div>
                <span className="font-display text-lg font-semibold text-ink">
                  {formatINR(product.dailyPrice)}
                </span>
                <span className="text-xs text-muted"> / day</span>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {formatINR(product.weeklyPrice)} weekly ·{" "}
                  {formatINR(product.monthlyPrice)} monthly
                </p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-10">
        <WishlistButton
          productId={product.id}
          initial={wishlisted}
          loggedIn={loggedIn}
        />
      </div>
    </article>
  );
}