"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BOOKING_STATUS_STYLES } from "@/lib/constants";

const statuses = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

export function BookingStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function update(next: string) {
    setBusy(true);
    setValue(next);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setValue(status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex items-center gap-1.5">
      <select
        value={value}
        onChange={(event) => update(event.target.value)}
        disabled={busy}
        className={`rounded-lg border-0 px-2 py-1.5 text-[10px] font-semibold outline-none ring-1 ring-inset ${
          BOOKING_STATUS_STYLES[value] ?? "bg-slate-100 text-slate-700 ring-slate-200"
        }`}
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item.charAt(0) + item.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {busy && <Loader2 className="h-3 w-3 animate-spin text-brand-600" />}
    </div>
  );
}