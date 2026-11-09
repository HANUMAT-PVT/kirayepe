import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();
  if (product.sellerId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div>
      <Link
        href="/dashboard/listings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to listings
      </Link>
      <div className="mt-4">
        <p className="section-eyebrow">Edit listing</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Update your product
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Changes to a live listing are sent for re-approval.
        </p>
      </div>

      <div className="mt-6">
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            title: product.title,
            description: product.description,
            categoryId: product.categoryId,
            brand: product.brand,
            condition: product.condition as "NEW" | "LIKE_NEW" | "GOOD" | "FAIR",
            images: product.images,
            dailyPrice: product.dailyPrice,
            weeklyPrice: product.weeklyPrice,
            monthlyPrice: product.monthlyPrice,
            sixMonthPrice: product.sixMonthPrice,
            yearlyPrice: product.yearlyPrice,
            extraDayPrice: product.extraDayPrice,
            securityDeposit: product.securityDeposit,
            location: product.location,
            city: product.city,
            isAvailable: product.isAvailable,
          }}
        />
      </div>
    </div>
  );
}