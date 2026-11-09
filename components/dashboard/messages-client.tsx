"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Send,
  Store,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SmartImage } from "@/components/smart-image";
import { cn, formatINR, timeAgo } from "@/lib/utils";

type ConversationSummary = {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  isSeller: boolean;
};

type ThreadMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
};

type ThreadResponse = {
  conversation: {
    id: string;
    customerId: string;
    sellerId: string;
    product: { id: string; title: string; images: string[]; city: string };
    customer: { id: string; name: string; avatar: string | null };
    seller: { id: string; name: string; avatar: string | null };
  };
  messages: ThreadMessage[];
  currentUserId: string;
};

export function MessagesClient({
  conversations,
  initialId,
  currentUserId,
}: {
  conversations: ConversationSummary[];
  initialId?: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(initialId ?? conversations[0]?.id ?? "");
  const [thread, setThread] = useState<ThreadResponse | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;

    fetch(`/api/conversations/${activeId}/messages`)
      .then(async (response) => {
        const data = await response.json();
        return { ok: response.ok, data };
      })
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? "Could not load messages");
          return;
        }
        setThread(data);
        window.setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 60);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      });

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  function select(id: string) {
    setActiveId(id);
    setThread(null);
    const url = new URL(window.location.href);
    url.searchParams.set("c", id);
    window.history.replaceState({}, "", url.toString());
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not send message");
      setThread((current) =>
        current
          ? { ...current, messages: [...current.messages, data.message] }
          : current,
      );
      setDraft("");
      router.refresh();
      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  const loading = Boolean(activeId) && thread?.conversation.id !== activeId;

  const other = thread
    ? thread.conversation.customerId === currentUserId
      ? thread.conversation.seller
      : thread.conversation.customer
    : null;

  return (
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_-32px_rgba(21,19,31,0.25)] lg:grid-cols-[320px_1fr] lg:min-h-[620px]">
      <div className={cn("border-r border-slate-100", activeId && "hidden lg:block")}>
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-display text-sm font-semibold text-ink">
            Conversations
          </h2>
          <p className="text-[10px] text-slate-400">
            {conversations.length} active{" "}
            {conversations.length === 1 ? "chat" : "chats"}
          </p>
        </div>
        <div className="max-h-[520px] overflow-y-auto p-2">
          {conversations.length === 0 && (
            <p className="p-4 text-center text-xs text-slate-400">
              No conversations yet.
            </p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => select(conversation.id)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-2xl p-2.5 text-left transition",
                activeId === conversation.id
                  ? "bg-brand-50 ring-1 ring-brand-100"
                  : "hover:bg-slate-50",
              )}
            >
              <Avatar
                name={conversation.otherName}
                src={conversation.otherAvatar}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {conversation.otherName}
                  </p>
                  <span className="shrink-0 text-[9px] text-slate-400">
                    {timeAgo(conversation.lastMessageAt)}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                  {conversation.productTitle}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread > 0 && (
                <span className="mt-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                  {conversation.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!activeId ? (
        <div className="hidden flex-col items-center justify-center gap-3 p-10 text-center lg:flex">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <MessageCircle className="h-6 w-6" />
          </span>
          <p className="font-display text-sm font-semibold text-ink">
            Select a conversation
          </p>
          <p className="max-w-xs text-xs text-slate-400">
            Message a seller from any product page to start a conversation.
          </p>
          <Link href="/products" className="btn-primary btn-sm">
            Browse rentals
          </Link>
        </div>
      ) : (
        <div className="flex min-h-[520px] flex-col">
          <div className="flex items-center gap-2.5 border-b border-slate-100 p-3.5">
            <button
              type="button"
              onClick={() => setActiveId("")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {thread ? (
              <>
                <Avatar name={other?.name ?? "User"} src={other?.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {other?.name}
                  </p>
                  <Link
                    href={`/products/${thread.conversation.product.id}`}
                    className="flex items-center gap-1 text-[10px] text-brand-700 hover:underline"
                  >
                    <Store className="h-2.5 w-2.5" />
                    {thread.conversation.product.title}
                  </Link>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="relative h-9 w-11 overflow-hidden rounded-lg bg-slate-100">
                    <SmartImage
                      src={thread.conversation.product.images[0]}
                      alt={thread.conversation.product.title}
                      sizes="80px"
                    />
                  </div>
                  <span className="text-xs font-semibold text-ink">
                    {formatINR(conversations.find((item) => item.id === activeId)?.productPrice ?? 0)}
                    <span className="text-[9px] font-normal text-slate-400">/day</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-100" />
            )}
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50/60 p-4">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
              </div>
            )}
            {!loading && thread?.messages.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">
                Say hello and ask about availability, condition or pickup.
              </p>
            )}
            {thread?.messages.map((message) => {
              const mine = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}
                >
                  {!mine && (
                    <Avatar
                      name={message.sender.name}
                      src={message.sender.avatar}
                      size="xs"
                      className="mt-auto"
                    />
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                      mine
                        ? "rounded-br-md bg-brand-600 text-white"
                        : "rounded-bl-md bg-white text-slate-700",
                    )}
                  >
                    <p>{message.body}</p>
                    <p
                      className={cn(
                        "mt-1 text-[9px]",
                        mine ? "text-white/60" : "text-slate-400",
                      )}
                    >
                      {timeAgo(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="border-t border-slate-100 p-3">
            {error && (
              <p className="mb-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[10px] text-rose-600">
                {error}
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                className="textarea min-h-[44px] flex-1 resize-none py-2.5"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(event);
                  }
                }}
                placeholder="Write a message… (Enter to send)"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="btn-primary h-11 w-11 shrink-0 p-0"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}