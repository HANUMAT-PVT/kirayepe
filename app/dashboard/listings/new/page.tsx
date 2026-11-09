import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata = { title: "Add product" };

export default async function NewListingPage() {
  await requireUser();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link
        href="/dashboard/listings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to listings
      </Link>
      <div className="mt-4">
        <p className="section-eyebrow">New listing</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          List a product for rent
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted">
          Add clear photos, honest details and flexible pricing. Your listing
          goes live after a quick admin review.
        </p>
      </div>

      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}