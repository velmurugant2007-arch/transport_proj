/**
 * TransitFlow ERP — Server-Side Sanitization Library
 * Strips HTML tags and normalizes user input before storage/rendering.
 * isomorphic-dompurify works in Node.js (no window needed).
 */
import DOMPurify from "isomorphic-dompurify";

/** Strip all HTML tags — safe for plain-text database fields */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/** Allow ZERO HTML — alias for clarity on strict fields */
export const sanitizeStrict = sanitizeText;

/** Truncate + sanitize — use for fields with known max lengths */
export function sanitizeField(input: unknown, maxLength = 500): string {
  const cleaned = sanitizeText(input);
  return cleaned.slice(0, maxLength);
}

/** Sanitize a number string and return parsed float or null */
export function sanitizeNumber(input: unknown): number | null {
  if (typeof input !== "string" && typeof input !== "number") return null;
  const n = parseFloat(String(input));
  return isNaN(n) || !isFinite(n) ? null : n;
}

/** Sanitize an integer */
export function sanitizeInt(input: unknown): number | null {
  const n = sanitizeNumber(input);
  return n === null ? null : Math.trunc(n);
}

/** Sanitize a date string — returns Date or null */
export function sanitizeDate(input: unknown): Date | null {
  if (!input || typeof input !== "string" || input.trim() === "") return null;
  const d = new Date(input.trim());
  return isNaN(d.getTime()) ? null : d;
}

/** Sanitize email — basic normalization */
export function sanitizeEmail(input: unknown): string {
  const s = sanitizeStrict(input);
  return s.toLowerCase().trim().slice(0, 255);
}

/** Sanitize URL — rejects javascript: and data: schemes */
export function sanitizeUrl(input: unknown): string {
  const s = sanitizeStrict(input);
  if (/^(javascript:|data:|vbscript:)/i.test(s)) return "";
  return s.slice(0, 2048);
}
