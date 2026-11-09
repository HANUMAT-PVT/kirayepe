import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid credentials" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 401 },
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "This account has been suspended. Contact the administrator." },
        { status: 403 },
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, role: user.role });
  } catch {
    return NextResponse.json(
      { error: "Could not sign you in. Please try again." },
      { status: 500 },
    );
  }
}