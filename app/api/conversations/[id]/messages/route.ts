import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validation";

async function getConversationForUser(conversationId: string, userId: string) {
  return db.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ customerId: userId }, { sellerId: userId }],
    },
    include: {
      product: { select: { id: true, title: true, images: true, city: true } },
      customer: { select: { id: true, name: true, avatar: true } },
      seller: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await getConversationForUser(id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const messages = await db.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  await db.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ conversation, messages, currentUserId: user.id });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await getConversationForUser(id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = messageSchema.safeParse({ conversationId: id, body: body.body });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid message" },
        { status: 400 },
      );
    }

    const message = await db.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        body: parsed.data.body,
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    await db.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    const recipientId =
      conversation.customerId === user.id
        ? conversation.sellerId
        : conversation.customerId;

    await db.notification.create({
      data: {
        userId: recipientId,
        type: "MESSAGE",
        title: `New message from ${user.name}`,
        message: parsed.data.body.slice(0, 120),
        href: `/dashboard/messages?c=${id}`,
      },
    });

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json(
      { error: "Could not send your message" },
      { status: 500 },
    );
  }
}