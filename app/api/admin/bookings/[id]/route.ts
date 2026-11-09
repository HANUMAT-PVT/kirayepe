import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";

const ALLOWED = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

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
    const status = String(body.status ?? "");
    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: { product: { select: { title: true } } },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await db.booking.update({
      where: { id },
      data: {
        status,
        paymentStatus:
          status === "CANCELLED"
            ? "DEMO_REFUNDED"
            : status === "COMPLETED"
              ? "DEMO_SETTLED"
              : booking.paymentStatus,
      },
    });

    await db.notification.create({
      data: {
        userId: booking.renterId,
        type: "BOOKING",
        title: `Booking ${status.toLowerCase()}`,
        message: `Your booking for ${booking.product.title} was updated to ${status.toLowerCase()} by the KirayePe team.`,
        href: "/dashboard/rentals",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not update booking" },
      { status: 500 },
    );
  }
}