import { NextResponse } from "next/server";
import { DURATIONS } from "@/lib/constants";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { calculateRental, type DurationKey } from "@/lib/pricing";
import { bookingSchema } from "@/lib/validation";
import { generateRef } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid booking" },
        { status: 400 },
      );
    }

    const { productId, startDate, endDate, notes } = parsed.data;
    const duration = parsed.data.duration as DurationKey;

    if (!Object.keys(DURATIONS).includes(duration)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { seller: { select: { id: true, name: true } } },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.sellerId === user.id) {
      return NextResponse.json(
        { error: "You cannot book your own listing" },
        { status: 400 },
      );
    }
    if (product.status !== "APPROVED" || !product.isAvailable) {
      return NextResponse.json(
        { error: "This product is not available for booking" },
        { status: 400 },
      );
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json(
        { error: "Return date must be after the start date" },
        { status: 400 },
      );
    }

    const pricing = calculateRental(product, duration, start, end);

    const booking = await db.booking.create({
      data: {
        productId: product.id,
        renterId: user.id,
        sellerId: product.sellerId,
        startDate: start,
        endDate: end,
        duration,
        days: pricing.days,
        rentalAmount: pricing.rentalAmount,
        securityDeposit: pricing.securityDeposit,
        platformFee: pricing.platformFee,
        totalAmount: pricing.totalAmount,
        status: "CONFIRMED",
        paymentStatus: "DEMO_PAID",
        demoPaymentRef: generateRef("DEMO"),
        notes: notes || null,
      },
    });

    await db.notification.createMany({
      data: [
        {
          userId: user.id,
          type: "BOOKING",
          title: "Demo booking confirmed",
          message: `Your booking for ${product.title} is confirmed. Payment was simulated.`,
          href: "/dashboard/rentals",
        },
        {
          userId: product.sellerId,
          type: "BOOKING",
          title: "New booking received",
          message: `${user.name} booked ${product.title} for ${pricing.days} days.`,
          href: "/dashboard/listings",
        },
      ],
    });

    return NextResponse.json({ bookingId: booking.id });
  } catch {
    return NextResponse.json(
      { error: "Could not place your booking" },
      { status: 500 },
    );
  }
}