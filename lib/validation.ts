import { z } from "zod";
import { CONDITION_OPTIONS, DURATIONS } from "./constants";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  city: z.string().trim().max(60).optional(),
});

export const productSchema = z.object({
  title: z.string().trim().min(8, "Title needs at least 8 characters").max(100),
  description: z
    .string()
    .trim()
    .min(30, "Describe your product in at least 30 characters")
    .max(3000),
  categoryId: z.string().min(1, "Choose a category"),
  brand: z.string().trim().min(2, "Enter the brand").max(60),
  condition: z.enum(CONDITION_OPTIONS),
  images: z
    .array(z.string().min(1))
    .min(1, "Add at least one image")
    .max(6, "You can add up to 6 images"),
  dailyPrice: z.number().min(1, "Daily price is required"),
  weeklyPrice: z.number().min(1, "Weekly price is required"),
  monthlyPrice: z.number().min(1, "Monthly price is required"),
  sixMonthPrice: z.number().min(1, "6-month price is required"),
  yearlyPrice: z.number().min(1, "Yearly price is required"),
  extraDayPrice: z.number().min(1, "Extra day price is required"),
  securityDeposit: z.number().min(0, "Deposit cannot be negative"),
  location: z.string().trim().min(3, "Add an area or locality").max(120),
  city: z.string().trim().min(2, "Add a city").max(60),
  isAvailable: z.boolean(),
});

export const productUpdateSchema = productSchema;

export const bookingSchema = z.object({
  productId: z.string().min(1),
  duration: z.enum(Object.keys(DURATIONS) as [string, ...string[]]),
  startDate: z.string().min(1, "Choose a start date"),
  endDate: z.string().min(1, "Choose an end date"),
  notes: z.string().trim().max(500).optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(8, "Write a short review").max(700),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  avatar: z.string().trim().max(500).optional(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProductInput = z.infer<typeof productSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;