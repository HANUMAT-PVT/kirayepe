export const SESSION_COOKIE = "kirayepe_session";
export const SESSION_DAYS = 7;

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const PRODUCT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const DURATIONS = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  SIX_MONTH: "SIX_MONTH",
  YEARLY: "YEARLY",
} as const;

export const DURATION_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  SIX_MONTH: "6 Months",
  YEARLY: "Yearly",
};

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "Brand new",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
};

export const CONDITION_OPTIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const;

export const BOOKING_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const PRODUCT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const PLATFORM_FEE_RATE = 0.05;
export const MIN_PLATFORM_FEE = 29;

export const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Indore",
  "Kochi",
] as const;

export const DEMO_PASSWORD = "KirayePe@123";