import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getApiUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (action === "remove") {
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
      return NextResponse.json({ ok: true, removed: true });
    }

    const data =
      action === "approve"
        ? { status: "APPROVED", isAvailable: true }
        : action === "reject"
          ? { status: "REJECTED", isAvailable: false }
          : action === "feature"
            ? { isFeatured: !product.isFeatured }
            : null;

    if (!data) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    await db.product.update({ where: { id }, data });

    if (action === "approve" || action === "reject") {
      await db.notification.create({
        data: {
          userId: product.sellerId,
          type: "LISTING",
          title:
            action === "approve" ? "Listing approved" : "Listing needs changes",
          message:
            action === "approve"
              ? `${product.title} is now live on KirayePe.`
              : `${product.title} was rejected by an admin. Update the details and resubmit.`,
          href:
            action === "approve"
              ? `/products/${product.id}`
              : `/dashboard/listings/${product.id}/edit`,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not update this listing" },
      { status: 500 },
    );
  }
}