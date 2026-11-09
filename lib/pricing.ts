import {
  MIN_PLATFORM_FEE,
  PLATFORM_FEE_RATE,
  type DURATIONS,
} from "./constants";
import { addDays, startOfToday } from "./utils";

export type DurationKey = keyof typeof DURATIONS;

export type PricingProduct = {
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  extraDayPrice: number;
  securityDeposit: number;
};

const DURATION_DAYS: Record<DurationKey, number> = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
  SIX_MONTH: 180,
  YEARLY: 365,
};

export function rentalDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff);
}

export function packagePrice(product: PricingProduct, duration: DurationKey) {
  switch (duration) {
    case "DAILY":
      return product.dailyPrice;
    case "WEEKLY":
      return product.weeklyPrice;
    case "MONTHLY":
      return product.monthlyPrice;
    case "SIX_MONTH":
      return product.sixMonthPrice;
    case "YEARLY":
      return product.yearlyPrice;
    default:
      return product.dailyPrice;
  }
}

export function defaultEndDate(duration: DurationKey, start = startOfToday()) {
  return addDays(start, DURATION_DAYS[duration]);
}

export function calculateRental(
  product: PricingProduct,
  duration: DurationKey,
  startDate: Date,
  endDate: Date,
) {
  const days = rentalDays(startDate, endDate);
  const unitDays = DURATION_DAYS[duration];
  let rentalAmount: number;

  if (duration === "DAILY") {
    rentalAmount = days * product.dailyPrice;
  } else {
    const fullUnits = Math.floor(days / unitDays);
    const extraDays = days - fullUnits * unitDays;
    const unitPrice = packagePrice(product, duration);
    rentalAmount =
      fullUnits === 0
        ? unitPrice
        : fullUnits * unitPrice + extraDays * product.extraDayPrice;
  }

  rentalAmount = Math.round(rentalAmount);
  const platformFee = Math.max(
    MIN_PLATFORM_FEE,
    Math.round(rentalAmount * PLATFORM_FEE_RATE),
  );
  const securityDeposit = Math.round(product.securityDeposit);
  const totalAmount = rentalAmount + platformFee + securityDeposit;

  return {
    days,
    rentalAmount,
    platformFee,
    securityDeposit,
    totalAmount,
  };
}