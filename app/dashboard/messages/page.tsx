import { MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessagesClient } from "@/components/dashboard/messages-client";

export const metadata = { title: "Messages" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const conversations = await db.conversation.findMany({
    where: { OR: [{ customerId: user.id }, { sellerId: user.id }] },
    include: {
      product: {
        select: { id: true, title: true, images: true, dailyPrice: true },
      },
      customer: { select: { id: true, name: true, avatar: true } },
      seller: { select: { id: true, name: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const unreadGroups = await db.message.groupBy({
    by: ["conversationId"],
    where: {
      readAt: null,
      senderId: { not: user.id },
      conversationId: { in: conversations.map((item) => item.id) },
    },
    _count: { _all: true },
  });
  const unreadMap = new Map(
    unreadGroups.map((item) => [item.conversationId, item._count._all]),
  );

  const summaries = conversations.map((conversation) => {
    const isSeller = conversation.sellerId === user.id;
    const other = isSeller ? conversation.customer : conversation.seller;
    return {
      id: conversation.id,
      productId: conversation.productId,
      productTitle: conversation.product.title,
      productImage: conversation.product.images[0] ?? "",
      productPrice: conversation.product.dailyPrice,
      otherName: other.name,
      otherAvatar: other.avatar,
      lastMessage: conversation.messages[0]?.body ?? "No messages yet",
      lastMessageAt: (
        conversation.messages[0]?.createdAt ?? conversation.createdAt
      ).toISOString(),
      unread: unreadMap.get(conversation.id) ?? 0,
      isSeller,
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Inbox</p>
          <h1 className="mt-1.5 flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Messages
            <span className="badge bg-brand-50 text-brand-700">
              {summaries.length}
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Chat directly with owners and renters about every booking.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {summaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <MessageCircle className="h-6 w-6" />
            </span>
            <h2 className="font-display text-lg font-semibold text-ink">
              No conversations yet
            </h2>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500">
              Open any product and tap “Chat with seller” to start a
              conversation. Every message is stored in MongoDB.
            </p>
          </div>
        ) : (
          <MessagesClient
            conversations={summaries}
            initialId={
              params.c && summaries.some((item) => item.id === params.c)
                ? params.c
                : undefined
            }
            currentUserId={user.id}
          />
        )}
      </div>
    </div>
  );
}