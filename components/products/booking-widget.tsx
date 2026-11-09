"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  IndianRupee,
  Info,
  ShieldCheck,
} from "lucide-react";
import { DURATIONS, DURATION_LABELS } from "@/lib/constants";
import {
  calculateRental,
  defaultEndDate,
  type DurationKey,
  type PricingProduct,
} from "@/lib/pricing";
import { addDays, cn, formatINR, startOfToday, toDateInput } from "@/lib/utils";

const durationOptions = Object.keys(DURATIONS) as DurationKey[];

export function BookingWidget({
  product,
  productId,
  available,
  loggedIn,
  isOwner,
}: {
  product: PricingProduct;
  productId: string;
  available: boolean;
  loggedIn: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const today = startOfToday();
  const [duration, setDuration] = useState<DurationKey>("WEEKLY");
  const [startDate, setStartDate] = useState(toDateInput(addDays(today, 1)));
  const [endDate, setEndDate] = useState(
    toDateInput(defaultEndDate("WEEKLY", addDays(today, 1))),
  );
  const [error, setError] = useState("");

  function changeDuration(next: DurationKey) {
    setDuration(next);
    const start = startDate ? new Date(`${startDate}T00:00:00`) : addDays(today, 1);
    setEndDate(toDateInput(defaultEndDate(next, start)));
    setError("");
  }

  function changeStart(value: string) {
    setStartDate(value);
    if (!value) return;
    const start = new Date(`${value}T00:00:00`);
    const currentEnd = endDate ? new Date(`${endDate}T00:00:00`) : start;
    if (currentEnd <= start) {
      setEndDate(toDateInput(defaultEndDate(duration, start)));
    }
    setError("");
  }

  const pricing = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (end <= start) return null;
    return calculateRental(product, duration, start, end);
  }, [startDate, endDate, duration, product]);

  function book() {
    if (!startDate || !endDate) {
      setError("Choose your rental dates to continue.");
      return;
    }
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (end <= start) {
      setError("End date must be after the start date.");
      return;
    }
    if (!loggedIn) {
      const target = `/checkout/${productId}?duration=${duration}&start=${startDate}&end=${endDate}`;
      router.push(`/login?next=${encodeURIComponent(target)}`);
      return;
    }
    router.push(
      `/checkout/${productId}?duration=${duration}&start=${startDate}&end=${endDate}`,
    );
  }

  return (
    <div className="rounded-[1.6rem] border border-slate-200/90 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(21,19,31,0.3)] lg:sticky lg:top-36">
      <div className="flex items-end justify-between">
        <div>
          <span className="font-display text-2xl font-semibold text-ink">
            {formatINR(product.dailyPrice)}
          </span>
          <span className="text-sm text-muted"> / day</span>
        </div>
        <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          <ShieldCheck className="h-3 w-3" /> Deposit protected
        </span>
      </div>

      <div className="mt-5">
        <span className="label">Rental duration</span>
        <div className="grid grid-cols-3 gap-1.5">
          {durationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => changeDuration(option)}
              className={cn(
                "rounded-xl border px-2 py-2 text-[11px] font-semibold transition",
                duration === option
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:border-brand-200 hover:text-brand-700",
              )}
            >
              {DURATION_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <label className="label flex items-center gap-1" htmlFor="start">
            <CalendarDays className="h-3 w-3" /> Start
          </label>
          <input
            id="start"
            type="date"
            className="input text-xs"
            min={toDateInput(today)}
            value={startDate}
            onChange={(event) => changeStart(event.target.value)}
          />
        </div>
        <div>
          <label className="label flex items-center gap-1" htmlFor="end">
            <CalendarDays className="h-3 w-3" /> Return
          </label>
          <input
            id="end"
            type="date"
            className="input text-xs"
            min={startDate || toDateInput(today)}
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setError("");
            }}
          />
        </div>
      </div>

      {pricing ? (
        <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>
              {formatINR(pricing.rentalAmount / Math.max(1, pricing.days))} ×{" "}
              {pricing.days} {pricing.days === 1 ? "day" : "days"}
            </span>
            <span className="font-medium text-ink">
              {formatINR(pricing.rentalAmount)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Platform fee (5%)</span>
            <span>{formatINR(pricing.platformFee)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Refundable deposit</span>
            <span>{formatINR(pricing.securityDeposit)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-sm">
            <span className="font-semibold text-ink">Total</span>
            <span className="font-display text-lg font-semibold text-ink">
              {formatINR(pricing.totalAmount)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] text-amber-700">
          Select a valid return date to see pricing.
        </div>
      )}

      {(error || !available) && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-600">
          {!available ? "This item is currently unavailable." : error}
        </p>
      )}

      <button
        type="button"
        onClick={book}
        disabled={!available || isOwner}
        className="btn-primary mt-4 w-full"
      >
        {isOwner
          ? "This is your listing"
          : available
            ? "Book now"
            : "Unavailable"}
        {available && !isOwner && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Demo checkout — no real payment is collected. The security deposit is
        shown for simulation and refunded after return.
      </p>

      <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3.5 text-[10px] text-slate-400">
        <IndianRupee className="h-3 w-3" />
        Prices in INR · Free cancellation before confirmation
      </div>
    </div>
  );
}