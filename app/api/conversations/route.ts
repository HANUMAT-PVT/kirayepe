import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product is required" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true, title: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.sellerId === user.id) {
      return NextResponse.json(
        { error: "This is your own listing" },
        { status: 400 },
      );
    }

    const existing = await db.conversation.findFirst({
      where: {
        productId: product.id,
        customerId: user.id,
        sellerId: product.sellerId,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ conversationId: existing.id });
    }

    const conversation = await db.conversation.create({
      data: {
        productId: product.id,
        customerId: user.id,
        sellerId: product.sellerId,
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        userId: product.sellerId,
        type: "MESSAGE",
        title: "A new conversation started",
        message: `${user.name} wants to talk about ${product.title}.`,
        href: `/dashboard/messages?c=${conversation.id}`,
      },
    });

    return NextResponse.json({ conversationId: conversation.id });
  } catch {
    return NextResponse.json(
      { error: "Could not start the conversation" },
      { status: 500 },
    );
  }
}