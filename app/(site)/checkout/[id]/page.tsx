import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateRental,
  defaultEndDate,
  type DurationKey,
} from "@/lib/pricing";
import { DURATIONS, DURATION_LABELS } from "@/lib/constants";
import { addDays, formatDate, formatINR, startOfToday, toDateInput } from "@/lib/utils";
import { SmartImage } from "@/components/smart-image";
import { Avatar } from "@/components/avatar";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ duration?: string; start?: string; end?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        select: { id: true, name: true, avatar: true, city: true },
      },
    },
  });

  if (!product || product.status !== "APPROVED" || !product.isAvailable) {
    notFound();
  }

  const duration = (
    Object.keys(DURATIONS).includes(query.duration ?? "")
      ? query.duration
      : "WEEKLY"
  ) as DurationKey;
  const start = query.start
    ? new Date(`${query.start}T00:00:00`)
    : addDays(startOfToday(), 1);
  const end = query.end
    ? new Date(`${query.end}T00:00:00`)
    : defaultEndDate(duration, start);
  const safeEnd = Number.isNaN(end.getTime()) || end <= start ? defaultEndDate(duration, start) : end;
  const startDate = toDateInput(Number.isNaN(start.getTime()) ? addDays(startOfToday(), 1) : start);
  const endDate = toDateInput(safeEnd);

  if (!user) {
    const target = `/checkout/${product.id}?duration=${duration}&start=${startDate}&end=${endDate}`;
    redirect(`/login?next=${encodeURIComponent(target)}`);
  }

  const pricing = calculateRental(product, duration, start, safeEnd);
  const isOwner = user.id === product.sellerId;

  return (
    <div className="page-shell py-10">
      <Link
        href={`/products/${product.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to listing
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Secure demo checkout</p>
          <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-ink">
            Review & book
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
          {["Details", "Payment", "Confirmation"].map((step, index) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold ${
                  index <= 1 ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {index + 1}
              </span>
              {step}
              {index < 2 && <span className="text-slate-300">→</span>}
            </span>
          ))}
        </div>
      </div>

      {isOwner ? (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-amber-900">
            This is your own listing
          </h2>
          <p className="mt-2 text-sm text-amber-700">
            You cannot book a product you own. Head back to your listing or
            explore other rentals.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              href="/dashboard/listings"
              className="btn-primary btn-sm"
            >
              Manage listing
            </Link>
            <Link href="/products" className="btn-secondary btn-sm">
              Explore rentals
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="card overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:w-36">
                  <SmartImage
                    src={product.images[0]}
                    alt={product.title}
                    sizes="200px"
                  />
                </div>
                <div className="flex-1">
                  <span className="badge bg-brand-50 text-brand-700">
                    {product.category.name}
                  </span>
                  <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                    {product.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3" /> {product.location},{" "}
                    {product.city}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar
                      name={product.seller.name}
                      src={product.seller.avatar}
                      size="xs"
                    />
                    <span className="text-[11px] text-slate-500">
                      Owned by {product.seller.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Starts
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <CalendarDays className="h-3.5 w-3.5 text-brand-500" />
                    {formatDate(startDate)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Returns
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <CalendarDays className="h-3.5 w-3.5 text-brand-500" />
                    {formatDate(endDate)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Duration
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                    {DURATION_LABELS[duration]} · {pricing.days} days
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <CheckoutForm
                productId={product.id}
                duration={duration}
                startDate={startDate}
                endDate={endDate}
                total={pricing.totalAmount}
              />
            </div>
          </div>

          <aside>
            <div className="card p-5 lg:sticky lg:top-36">
              <h2 className="font-display text-base font-semibold text-ink">
                Price summary
              </h2>
              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>
                    Rental ({DURATION_LABELS[duration]} · {pricing.days} days)
                  </span>
                  <span className="font-medium text-ink">
                    {formatINR(pricing.rentalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform fee</span>
                  <span>{formatINR(pricing.platformFee)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Security deposit</span>
                  <span>{formatINR(pricing.securityDeposit)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-slate-500">
                  <span>Deposit refund</span>
                  <span className="text-emerald-600">
                    +{formatINR(pricing.securityDeposit)}
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Total payable</p>
                    <p className="text-[10px] text-slate-400">Incl. refundable deposit</p>
                  </div>
                  <p className="font-display text-2xl font-semibold text-ink">
                    {formatINR(pricing.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-emerald-50 p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Booking protection
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-emerald-700/80">
                  The deposit is held during the rental and released back after a
                  verified return. Free cancellation before pickup.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 p-3">
                <BadgeIndianRupee className="h-4 w-4 text-brand-600" />
                <p className="text-[10px] text-slate-500">
                  Demo payments are marked clearly. No real money moves.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}