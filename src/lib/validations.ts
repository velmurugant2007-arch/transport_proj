/**
 * TransitFlow ERP — Zod Validation Schemas
 * All server action inputs and API route bodies must be validated here
 * before any database operation or business logic runs.
 */
import { z } from "zod";

/* ── Shared primitives ── */
const safeStr  = (max = 255) => z.string().trim().max(max).transform(s => s.replace(/<[^>]*>/g, ""));
const optStr   = (max = 255) => safeStr(max).optional().nullable().transform(v => v ?? null);
const safeDate = z.union([
  z.string().trim().refine(v => !isNaN(Date.parse(v)), { message: "Invalid date" }).transform(v => new Date(v)),
  z.date()
]);
const optDate = z.union([
  z.string().trim().optional().nullable().transform(v => {
    if (!v || v.trim() === "") return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }),
  z.date().optional().nullable()
]);
const posFloat = z.coerce.number().nonnegative().finite().max(9_999_999);
const posInt   = z.coerce.number().int().nonnegative().max(1000);
const nonNegInt = z.coerce.number().int().nonnegative().max(1000);

/* ─────────────────────────────────────────────
   AUTH
───────────────────────────────────────────── */
export const LoginSchema = z.object({
  email:    z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

export const RegisterSchema = z.object({
  name:     safeStr(100),
  email:    z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

/* ─────────────────────────────────────────────
   VEHICLE
───────────────────────────────────────────── */
export const VehicleSchema = z.object({
  BUS_NUMBER:          safeStr(30),
  REGISTER_NUMBER:     optStr(100),
  FUEL_TYPE:           z.preprocess((val) => String(val).toUpperCase(), z.enum(["DIESEL", "CNG", "NOT_ALLOCATED"])),
  MAKE:                optStr(100),
  MODEL:               optStr(100),
  CAPACITY:            nonNegInt,
  DRIVER_NAME:         optStr(100),
  DRIVER_PHONE:        optStr(20),
  STATUS:              z.preprocess(
    (val) => (val ? String(val).toUpperCase() : "ACTIVE"),
    z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE", "BROKEN DOWN"])
  ).optional().default("ACTIVE"),
});
export type VehicleInput = z.infer<typeof VehicleSchema>;

/* ─────────────────────────────────────────────
   VEHICLE DOCUMENTS
───────────────────────────────────────────── */
export const VehicleDocSchema = z.object({
  INSURANCE_NUMBER:   optStr(100),
  INSURANCE_DUE_DATE: optDate,
  INSURANCE_EXPIRY:   optDate,
  TAX_NUMBER:         optStr(100),
  TAX_DUE_DATE:       optDate,
  TAX_EXPIRY:         optDate,
  ROAD_PERMIT_NUMBER: optStr(100),
  ROAD_PERMIT_EXPIRY: optDate,
  POLLUTION_NUMBER:   optStr(100),
  POLLUTION_EXPIRY:   optDate,
  FC_NUMBER:          optStr(100),
  FC_EXPIRY:          optDate,
});
export type VehicleDocInput = z.infer<typeof VehicleDocSchema>;

/* ─────────────────────────────────────────────
   ROUTE
───────────────────────────────────────────── */
export const RouteSchema = z.object({
  NAME:           safeStr(200),
  DESCRIPTION:    optStr(500),
  DISTANCE:       z.coerce.number().nonnegative().finite().max(9999).optional().nullable().transform(v => v ?? null),
  TIMING:         optStr(100),
  assignedBusIds: z.array(z.string()).optional().default([]),
  boardingPoints: z.array(z.object({
    NAME:     safeStr(200),
    AMOUNT:   z.coerce.number().nonnegative().optional().default(0),
    DISTANCE: z.coerce.number().nonnegative().optional().default(0),
    TIMING:   optStr(100),
  })).optional().default([]),
});

/* ─────────────────────────────────────────────
   STUDENT
───────────────────────────────────────────── */
export const StudentSchema = z.object({
  STUDENT_NAME:     safeStr(150),
  REGISTER_NUMBER:  safeStr(50),
  SERIAL_NUMBER:    optStr(50),
  YEAR:             optStr(20),
  DEGREE:           optStr(50),
  BRANCH:           optStr(100),
  AREA:             optStr(150),
  BOARDING_POINT:   optStr(150),
  BUS_NUMBER:       optStr(100),
  BUS_REG_NUMBER:   optStr(100),
  AMOUNT:           z.coerce.number().nonnegative().optional().default(0),
  CHALLAN_NUMBER:   optStr(50),
  PAYMENT_MODE:     optStr(50),
  PAYMENT_DATE:     optDate,
  PAYMENT_STATUS:   z.enum(["PAID", "PENDING", "UNPAID"]).optional().default("PENDING"),
  ORDER:            optStr(100),
  BUNCH:            optStr(100),
  routeId:          optStr(100),
  boardingPointId:  optStr(100),
  assignedBusId:    optStr(100),
});

/* ─────────────────────────────────────────────
   TRANSPORT REGISTRY
───────────────────────────────────────────── */
export const TransportRecordSchema = z.object({
  SERIAL_NUMBER:   optStr(50),
  REGISTER_NUMBER: safeStr(50),
  NAME:           safeStr(150),
  YEAR:           optStr(20),
  DEGREE:         optStr(50),
  BRANCH:         optStr(100),
  BOARDING_POINT:  optStr(150),
  ROUTE_SECTOR:    optStr(150),
  BUS_NUMBER:      optStr(100),
  BUS_REG_NUMBER:   optStr(100),
  AMOUNT:         z.coerce.number().nonnegative().optional().default(0),
  AREA:           optStr(150),
  CHALLAN_NUMBER:  optStr(50),
  PAYMENT_MODE:    optStr(50),
  PAYMENT_DATE:    optDate,
  PAYMENT_STATUS:  optStr(50),
  ORDER:          optStr(100),
  BUNCH:          optStr(100),
});

/* ─────────────────────────────────────────────
   FUEL LOG
───────────────────────────────────────────── */
export const FuelLogSchema = z.object({
  vehicleId:     z.string().cuid(),
  DATE:          safeDate,
  FUEL_TYPE:     z.string().max(50),
  LITRES:        posFloat,
  AMOUNT:        posFloat,
  OPENING_KM:    posFloat,
  CLOSING_KM:    posFloat.optional().nullable(),
  INDENT_NUMBER: optStr(50),
}).refine(data => !data.CLOSING_KM || data.CLOSING_KM >= data.OPENING_KM, {
  message: "Ending odometer must be greater than or equal to starting odometer",
  path: ["CLOSING_KM"],
});

/* ─────────────────────────────────────────────
   MAINTENANCE LOG
───────────────────────────────────────────── */
export const MaintenanceLogSchema = z.object({
  vehicleId:         z.string().cuid(),
  DATE:              safeDate,
  SERVICE_TYPE:      z.enum(["Regular", "Breakdown"]),
  AMOUNT:            z.coerce.number().nonnegative().finite().max(9_999_999),
  SERVICE_CENTER:    optStr(200),
  BREAKDOWN_DETAILS: optStr(1000),
  SPARE_PARTS:       optStr(500),
  NEXT_SERVICE_DATE: optDate,
  NOTES:             optStr(1000),
});

/* ─────────────────────────────────────────────
   EXPENSE
───────────────────────────────────────────── */
export const ExpenseSchema = z.object({
  TYPE:       z.enum(["Toll", "Parking", "Allowance", "Emergency", "Miscellaneous"]),
  AMOUNT:     z.coerce.number().nonnegative().finite().max(9_999_999),
  DATE:       safeDate,
  vehicleIds: z.array(z.string()).optional().default([]),
  NOTES:      optStr(500),
});
