"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";

export function ChatWithSeller({
  productId,
  loggedIn,
  className,
}: {
  productId: string;
  loggedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startChat() {
    if (!loggedIn) {
      router.push(`/login?next=/products/${productId}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not start chat");
      router.push(`/dashboard/messages?c=${data.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={startChat}
        disabled={busy}
        className="btn-secondary w-full"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        {busy ? "Opening chat…" : "Chat with seller"}
      </button>
      {error && <p className="mt-1.5 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}