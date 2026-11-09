"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (
      !window.confirm(
        "Delete this listing permanently? Listings with bookings cannot be deleted.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete listing");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
        title={error || "Delete listing"}
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
        Delete
      </button>
    </span>
  );
}