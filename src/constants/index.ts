/**
 * App-wide constants for TransitFlow ERP.
 * Centralizes all dropdown options, enums, and config values.
 * Import from "@/constants" throughout the codebase.
 */

// ── Vehicle ────────────────────────────────────────────────────────────────

export const VEHICLE_TYPES = ["Bus", "Mini Bus", "Van", "Car"] as const;
export type VehicleType = typeof VEHICLE_TYPES[number];

export const VEHICLE_STATUSES = ["ACTIVE", "INACTIVE", "MAINTENANCE"] as const;
export type VehicleStatusConst = typeof VEHICLE_STATUSES[number];

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  ACTIVE:      "Active",
  INACTIVE:    "Inactive",
  MAINTENANCE: "Maintenance",
};

// ── Fuel ──────────────────────────────────────────────────────────────────

export const FUEL_TYPES = ["Diesel", "Petrol", "CNG", "EV"] as const;
export type FuelType = typeof FUEL_TYPES[number];

// ── Maintenance ───────────────────────────────────────────────────────────

export const SERVICE_TYPES = [
  "Routine Service",
  "Oil Change",
  "Tyre Replacement",
  "Battery Replacement",
  "Brake Service",
  "Engine Repair",
  "Breakdown",
  "Body Work",
  "AC Repair",
  "Other",
] as const;
export type ServiceType = typeof SERVICE_TYPES[number];

// ── Expenses ──────────────────────────────────────────────────────────────

export const EXPENSE_TYPES = [
  "Fuel",
  "Maintenance",
  "Insurance",
  "Tax",
  "Permit",
  "Driver Salary",
  "Toll",
  "Parking",
  "Other",
] as const;
export type ExpenseType = typeof EXPENSE_TYPES[number];

// ── Documents ─────────────────────────────────────────────────────────────

/** Days before expiry that triggers a warning notification */
export const EXPIRY_WARNING_DAYS = 30;

// ── App config ────────────────────────────────────────────────────────────

export const APP_NAME    = "PSNA TRANSPORT MANAGEMENT";
export const APP_TAGLINE = "Institutional Fleet Operations Platform";
