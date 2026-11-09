"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!window.confirm("Cancel this demo booking? Your simulated deposit will be marked refunded.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not cancel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        Cancel booking
      </button>
      {error && <p className="mt-1 text-[10px] text-rose-600">{error}</p>}
    </div>
  );
}