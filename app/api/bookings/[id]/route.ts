import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const booking = await db.booking.findUnique({
      where: { id },
      include: { product: { select: { title: true } } },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isRenter = booking.renterId === user.id;
    const isSeller = booking.sellerId === user.id;
    if (!isRenter && !isSeller) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    if (action === "cancel") {
      if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
        return NextResponse.json(
          { error: "This booking can no longer be cancelled online" },
          { status: 400 },
        );
      }
    } else if (action === "confirm") {
      if (!isSeller || booking.status !== "PENDING") {
        return NextResponse.json({ error: "Not allowed" }, { status: 403 });
      }
    } else if (action === "complete") {
      if (!isSeller || !["ACTIVE", "CONFIRMED"].includes(booking.status)) {
        return NextResponse.json({ error: "Not allowed" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const nextStatus =
      action === "cancel"
        ? "CANCELLED"
        : action === "confirm"
          ? "CONFIRMED"
          : "COMPLETED";

    await db.booking.update({
      where: { id },
      data: {
        status: nextStatus,
        paymentStatus:
          action === "cancel"
            ? "DEMO_REFUNDED"
            : action === "complete"
              ? "DEMO_SETTLED"
              : booking.paymentStatus,
      },
    });

    const recipientId = isSeller ? booking.renterId : booking.sellerId;
    const title =
      action === "cancel"
        ? "Booking cancelled"
        : action === "confirm"
          ? "Booking confirmed by owner"
          : "Rental completed";
    const message =
      action === "cancel"
        ? `The booking for ${booking.product.title} was cancelled.`
        : action === "confirm"
          ? `${user.name} confirmed your booking for ${booking.product.title}.`
          : `Your rental of ${booking.product.title} is marked complete. Deposit refund simulated.`;

    await db.notification.create({
      data: {
        userId: recipientId,
        type: "BOOKING",
        title,
        message,
        href: isSeller ? "/dashboard/rentals" : "/dashboard/listings",
      },
    });

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch {
    return NextResponse.json(
      { error: "Could not cancel this booking" },
      { status: 500 },
    );
  }
}