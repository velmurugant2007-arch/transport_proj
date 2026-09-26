/**
 * Shared utility functions for TransitFlow ERP.
 * Import from "@/utils" throughout the codebase.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind className merge (re-exported from lib/utils) ─────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatting ───────────────────────────────────────────────────────

/**
 * Formats a Date to "DD MMM YYYY" (e.g., "01 Jan 2025").
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

/**
 * Formats a Date to an HTML date input value "YYYY-MM-DD".
 */
export function toInputDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

/**
 * Returns today's date as "YYYY-MM-DD" for use as a default input value.
 */
export function todayInputDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns true if the given date is within `days` days from now.
 */
export function isExpiringSoon(
  date: Date | string | null | undefined,
  days = 30
): boolean {
  if (!date) return false;
  const target = new Date(date);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return target <= threshold;
}

/**
 * Returns true if the given date is already past.
 */
export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

// ── Currency / Number formatting ─────────────────────────────────────────

/**
 * Formats a number as Indian Rupees (e.g., ₹1,234.50).
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "₹0";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Formats a number with 1 decimal place (e.g., for litres).
 */
export function formatQuantity(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toFixed(1);
}

/**
 * Formats km/L mileage (e.g., "12.5 km/L").
 */
export function formatMileage(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(1)} km/L`;
}
