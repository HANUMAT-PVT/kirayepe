"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export function SellerBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function run(action: "confirm" | "complete" | "cancel") {
    if (action === "cancel" && !window.confirm("Cancel this customer booking?")) {
      return;
    }
    setBusy(action);
    setError("");
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update booking");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1">
        {status === "PENDING" && (
          <button
            type="button"
            onClick={() => run("confirm")}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            {busy === "confirm" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            Confirm
          </button>
        )}
        {["CONFIRMED", "ACTIVE"].includes(status) && (
          <button
            type="button"
            onClick={() => run("complete")}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1.5 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            {busy === "complete" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            Mark complete
          </button>
        )}
        {["PENDING", "CONFIRMED"].includes(status) && (
          <button
            type="button"
            onClick={() => run("cancel")}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            {busy === "cancel" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            Cancel
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[10px] text-rose-600">{error}</p>}
    </div>
  );
}