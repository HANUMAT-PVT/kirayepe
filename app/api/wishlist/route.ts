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
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = await db.wishlist.findFirst({
      where: { userId: user.id, productId },
    });

    if (existing) {
      await db.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await db.wishlist.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json(
      { error: "Could not update your wishlist" },
      { status: 500 },
    );
  }
}