import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile" },
        { status: 400 },
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        city: parsed.data.city || null,
        bio: parsed.data.bio || null,
        avatar: parsed.data.avatar || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not update your profile" },
      { status: 500 },
    );
  }
}