import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(value: number, compact = false) {
  if (compact && value >= 100000) {
    return `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L`;
  }
  if (compact && value >= 1000) {
    return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatShortDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function timeAgo(value: Date | string) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function averageRating(ratings: { rating: number }[]) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function generateRef(prefix = "DEMO") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now()
    .toString()
    .slice(-5)}`;
}