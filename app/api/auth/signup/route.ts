import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid details" },
        { status: 400 },
      );
    }

    const { name, email, password, city } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        city: city || null,
        role: "USER",
        avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(email)}`,
      },
      select: { id: true, email: true, role: true },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    await db.notification.create({
      data: {
        userId: user.id,
        type: "WELCOME",
        title: "Welcome to KirayePe",
        message:
          "Your account is ready. Explore rentals or list your first product to start earning.",
        href: "/products",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 },
    );
  }
}