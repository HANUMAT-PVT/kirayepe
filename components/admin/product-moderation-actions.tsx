"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

export function ProductModerationActions({
  productId,
  status,
  featured,
}: {
  productId: string;
  status: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function run(action: string) {
    if (
      action === "remove" &&
      !window.confirm("Remove this listing permanently from the platform?")
    ) {
      return;
    }
    setBusy(action);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update listing");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {status !== "APPROVED" && (
        <button
          type="button"
          onClick={() => run("approve")}
          disabled={Boolean(busy)}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          {busy === "approve" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          Approve
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          type="button"
          onClick={() => run("reject")}
          disabled={Boolean(busy)}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1.5 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-100"
        >
          {busy === "reject" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          Reject
        </button>
      )}
      <button
        type="button"
        onClick={() => run("feature")}
        disabled={Boolean(busy)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition ${
          featured
            ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {busy === "feature" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        type="button"
        onClick={() => run("remove")}
        disabled={Boolean(busy)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-rose-600 transition hover:bg-rose-50"
      >
        {busy === "remove" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
        Remove
      </button>
    </div>
  );
}