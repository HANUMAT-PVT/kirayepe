import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const sessionUser = await getApiUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid password" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not change your password" },
      { status: 500 },
    );
  }
}