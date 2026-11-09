"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenLine } from "lucide-react";
import { StarPicker } from "@/components/rating";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not add review");
      setComment("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary btn-sm"
      >
        <PenLine className="h-3.5 w-3.5" /> Write a review
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Rate this rental</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <textarea
        className="textarea mt-3 bg-white"
        rows={3}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="How was the product, the owner and the handover?"
        required
        minLength={8}
      />
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary btn-sm">
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {busy ? "Posting…" : "Post review"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-ghost btn-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}