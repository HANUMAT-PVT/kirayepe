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
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Administrator accounts cannot be suspended" },
        { status: 400 },
      );
    }

    const isSuspended =
      action === "suspend" ? true : action === "activate" ? false : null;
    if (isSuspended === null) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    await db.user.update({ where: { id }, data: { isSuspended } });

    await db.notification.create({
      data: {
        userId: id,
        type: "ACCOUNT",
        title: isSuspended ? "Account suspended" : "Account reactivated",
        message: isSuspended
          ? "Your account was suspended by an administrator. Contact support for details."
          : "Your account is active again. Welcome back to KirayePe.",
        href: "/dashboard",
      },
    });

    return NextResponse.json({ ok: true, isSuspended });
  } catch {
    return NextResponse.json({ error: "Could not update user" }, { status: 500 });
  }
}