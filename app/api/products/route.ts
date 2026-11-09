import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const product = await db.product.create({
      data: {
        ...parsed.data,
        description: parsed.data.description.trim(),
        images: parsed.data.images.filter(Boolean),
        sellerId: user.id,
        status: "PENDING",
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        userId: user.id,
        type: "LISTING",
        title: "Listing submitted for review",
        message: `${parsed.data.title} is pending admin approval and will go live shortly.`,
        href: "/dashboard/listings",
      },
    });

    return NextResponse.json({ productId: product.id });
  } catch {
    return NextResponse.json(
      { error: "Could not create your listing" },
      { status: 500 },
    );
  }
}