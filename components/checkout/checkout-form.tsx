"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

const methods = [
  { id: "UPI", label: "UPI", icon: Smartphone, note: "GPay · PhonePe · Paytm" },
  { id: "CARD", label: "Card", icon: CreditCard, note: "Visa · Mastercard · RuPay" },
  { id: "NETBANKING", label: "Net banking", icon: Landmark, note: "All major banks" },
];

export function CheckoutForm({
  productId,
  duration,
  startDate,
  endDate,
  total,
}: {
  productId: string;
  duration: string;
  startDate: string;
  endDate: string;
  total: number;
}) {
  const router = useRouter();
  const [method, setMethod] = useState("UPI");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!agreed) {
      setError("Please accept the demo payment terms to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          duration,
          startDate,
          endDate,
          notes: `Demo payment via ${method}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not place booking");
      router.push(`/dashboard/rentals?booked=${data.bookingId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              This is a simulated payment
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">
              No money will be charged and no card details are required. This
              checkout exists to demonstrate the complete KirayePe booking flow.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-base font-semibold text-ink">
          Choose a payment method
        </h2>
        <div className="mt-4 grid gap-2">
          {methods.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMethod(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition",
                method === item.id
                  ? "border-brand-400 bg-brand-50/60 ring-4 ring-brand-50"
                  : "border-slate-200 hover:border-brand-200",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl",
                  method === item.id
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.note}</p>
              </div>
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full border",
                  method === item.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300",
                )}
              >
                {method === item.id && <Check className="h-3 w-3" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => {
              setAgreed(event.target.checked);
              setError("");
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600"
          />
          <span className="text-[11px] leading-relaxed text-slate-500">
            I understand this is a demonstration checkout. I agree to the demo
            rental terms and to keep the product safe for the rental period.
            Security deposit of the booking will be shown as refunded after
            return.
          </span>
        </label>

        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !agreed}
          className="btn-primary btn-lg mt-4 w-full"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          {busy ? "Processing demo payment…" : `Pay ${formatINR(total)} (demo)`}
        </button>
        <p className="mt-2.5 text-center text-[10px] text-slate-400">
          No real payment · Secured demo environment
        </p>
      </div>
    </form>
  );
}