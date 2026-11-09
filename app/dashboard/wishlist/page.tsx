import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { productInclude } from "@/lib/product-query";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser();

  const items = await db.wishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: productInclude,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = items
    .filter((item) => item.product.status === "APPROVED")
    .map((item) => item.product);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Saved for later</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            My wishlist
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {products.length} {products.length === 1 ? "rental" : "rentals"} saved.
            Keep the good ones close.
          </p>
        </div>
        <Link href="/products" className="btn-secondary btn-sm">
          Find more rentals
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Your wishlist is empty"
            description="Tap the heart on any listing to save it here for later. Perfect for comparing options before you book."
            action={
              <Link href="/products" className="btn-primary btn-sm">
                <Sparkles className="h-4 w-4" /> Discover products
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              loggedIn
              wishlisted
            />
          ))}
        </div>
      )}
    </div>
  );
}