import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_DAYS } from "./constants";
import { db } from "./db";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "kirayepe-local-development-secret",
);

export type SessionPayload = {
  userId: string;
  role: string;
  email: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.userId || !payload.email) return null;
    return {
      userId: String(payload.userId),
      role: String(payload.role ?? "USER"),
      email: String(payload.email),
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      bio: true,
      city: true,
      isSuspended: true,
      createdAt: true,
    },
  });

  if (!user || user.isSuspended) return null;
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function getApiUser() {
  return getCurrentUser();
}