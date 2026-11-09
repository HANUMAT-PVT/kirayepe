"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initial = false,
  loggedIn,
  className,
  showLabel = false,
}: {
  productId: string;
  initial?: boolean;
  loggedIn: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!loggedIn) {
      router.push(`/login?next=/products/${productId}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update wishlist");
      setSaved(data.saved);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      title={error || (saved ? "Remove from wishlist" : "Save to wishlist")}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:border-rose-200 hover:text-rose-600 disabled:opacity-60",
        saved && "border-rose-200 text-rose-600",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
      {showLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}