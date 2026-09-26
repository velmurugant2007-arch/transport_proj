/**
 * Shared TypeScript types for TransitFlow ERP.
 * Import from "@/types" throughout the codebase.
 */

// ── Vehicle ────────────────────────────────────────────────────────────────

export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface Vehicle {
  id: string;
  number: string;
  type: string;
  make: string;
  model: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
  // Document fields
  insuranceNumber?: string | null;
  insuranceDueDate?: Date | null;
  insuranceExpiry?: Date | null;
  taxNumber?: string | null;
  taxDueDate?: Date | null;
  taxExpiry?: Date | null;
  roadPermitNumber?: string | null;
  roadPermitExpiry?: Date | null;
  pollutionNumber?: string | null;
  pollutionExpiry?: Date | null;
  fcNumber?: string | null;
  fcExpiry?: Date | null;
}

export type VehicleOption = Pick<Vehicle, "id" | "number" | "type">;

// ── Route ─────────────────────────────────────────────────────────────────

export interface Route {
  id: string;
  name: string;
  description?: string | null;
  distance?: number | null;
  timing?: string | null;
  createdAt: Date;
}

export type RouteOption = Pick<Route, "id" | "name">;

// ── Student ───────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  routeId?: string | null;
  assignedBusId?: string | null;
  createdAt: Date;
  route?: RouteOption | null;
  assignedBus?: VehicleOption | null;
}

// ── Fuel ──────────────────────────────────────────────────────────────────

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: Date;
  fuelType: string;
  quantity: number;
  cost: number;
  odometer: number;
  distanceTravelled?: number | null;
  mileage?: number | null;
  createdAt: Date;
  vehicle: VehicleOption;
}

// ── Maintenance ───────────────────────────────────────────────────────────

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: Date;
  serviceType: string;
  cost: number;
  serviceCenter?: string | null;
  breakdownDetails?: string | null;
  spareParts?: string | null;
  nextServiceDate?: Date | null;
  notes?: string | null;
  createdAt: Date;
  vehicle: VehicleOption;
}

// ── Expense ───────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  type: string;
  amount: number;
  date: Date;
  vehicleId?: string | null;
  notes?: string | null;
  createdAt: Date;
  vehicle?: VehicleOption | null;
}

// ── Notification ──────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  vehicleId?: string | null;
  createdAt: Date;
}

// ── Server Action result ──────────────────────────────────────────────────

export interface ActionResult {
  success: boolean;
  error?: string;
}
