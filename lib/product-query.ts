import type { Prisma } from "@prisma/client";

export const productInclude = {
  category: true,
  seller: {
    select: {
      id: true,
      name: true,
      avatar: true,
      city: true,
      createdAt: true,
      isSuspended: true,
    },
  },
  reviews: {
    select: { rating: true },
  },
  _count: {
    select: { bookings: true, wishlistedBy: true },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithMeta = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export const bookingInclude = {
  product: {
    include: {
      category: true,
      seller: {
        select: { id: true, name: true, avatar: true, city: true },
      },
    },
  },
  renter: {
    select: { id: true, name: true, email: true, avatar: true, city: true },
  },
  seller: {
    select: { id: true, name: true, email: true, avatar: true, city: true },
  },
} satisfies Prisma.BookingInclude;

export const conversationInclude = {
  product: {
    select: {
      id: true,
      title: true,
      images: true,
      dailyPrice: true,
      city: true,
    },
  },
  customer: {
    select: { id: true, name: true, avatar: true },
  },
  seller: {
    select: { id: true, name: true, avatar: true },
  },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
} satisfies Prisma.ConversationInclude;

export type ConversationWithMeta = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

export const publicProductWhere = {
  status: "APPROVED",
  isAvailable: true,
  seller: { isSuspended: false },
} satisfies Prisma.ProductWhereInput;