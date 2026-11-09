"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";

export function SuspendUserButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (
      !window.confirm(
        suspended
          ? "Activate this account again?"
          : "Suspend this account? They will be signed out and cannot log in.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: suspended ? "activate" : "suspend" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update user");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={error || (suspended ? "Activate account" : "Suspend account")}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition ${
        suspended
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-rose-50 text-rose-600 hover:bg-rose-100"
      }`}
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : suspended ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <ShieldOff className="h-3 w-3" />
      )}
      {suspended ? "Activate" : "Suspend"}
    </button>
  );
}