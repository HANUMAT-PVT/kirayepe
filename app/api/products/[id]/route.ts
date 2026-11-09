import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.sellerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid product" },
        { status: 400 },
      );
    }

    const category = await db.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    await db.product.update({
      where: { id },
      data: {
        ...parsed.data,
        description: parsed.data.description.trim(),
        images: parsed.data.images.filter(Boolean),
        status: user.role === "ADMIN" ? product.status : "PENDING",
      },
    });

    return NextResponse.json({ productId: id });
  } catch {
    return NextResponse.json(
      { error: "Could not update your listing" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.sellerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const bookingCount = await db.booking.count({ where: { productId: id } });
  if (bookingCount > 0) {
    return NextResponse.json(
      {
        error:
          "This listing has bookings, so it cannot be deleted. Mark it unavailable instead.",
      },
      { status: 409 },
    );
  }

  const conversations = await db.conversation.findMany({
    where: { productId: id },
    select: { id: true },
  });

  await db.$transaction([
    db.message.deleteMany({
      where: { conversationId: { in: conversations.map((item) => item.id) } },
    }),
    db.conversation.deleteMany({ where: { productId: id } }),
    db.review.deleteMany({ where: { productId: id } }),
    db.wishlist.deleteMany({ where: { productId: id } }),
    db.product.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}