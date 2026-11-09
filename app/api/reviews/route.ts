import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid review" },
        { status: 400 },
      );
    }

    const { productId, rating, comment } = parsed.data;
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true, title: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.sellerId === user.id) {
      return NextResponse.json(
        { error: "You cannot review your own listing" },
        { status: 400 },
      );
    }

    const booking = await db.booking.findFirst({
      where: {
        productId,
        renterId: user.id,
        status: { in: ["COMPLETED", "ACTIVE", "CONFIRMED"] },
      },
    });
    if (!booking) {
      return NextResponse.json(
        { error: "You can review a product after booking it" },
        { status: 403 },
      );
    }

    const existing = await db.review.findFirst({
      where: { productId, authorId: user.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this rental" },
        { status: 409 },
      );
    }

    const review = await db.review.create({
      data: {
        productId,
        authorId: user.id,
        targetId: product.sellerId,
        rating,
        comment,
      },
    });

    await db.notification.create({
      data: {
        userId: product.sellerId,
        type: "REVIEW",
        title: `New ${rating}-star review`,
        message: `${user.name} reviewed ${product.title}.`,
        href: `/products/${productId}#reviews`,
      },
    });

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json(
      { error: "Could not post your review" },
      { status: 500 },
    );
  }
}