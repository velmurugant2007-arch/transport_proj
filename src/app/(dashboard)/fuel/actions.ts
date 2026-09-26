"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FuelLogSchema } from "@/lib/validations";
import { withTracking } from "@/lib/tracking";

function parseFormData(formData: FormData) {
  return {
    vehicleId:     formData.get("vehicleId"),
    DATE:          formData.get("date"),
    FUEL_TYPE:     formData.get("fuelType"),
    LITRES:        formData.get("quantity"),
    AMOUNT:        formData.get("cost"),
    OPENING_KM:    formData.get("startOdometer"),
    CLOSING_KM:    formData.get("endOdometer"),
    INDENT_NUMBER: formData.get("indentNumber"),
  };
}

export async function createFuelLog(formData: FormData) {
  const parsed = FuelLogSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid fuel log data: " + parsed.error.issues[0].message);
  }
  const { OPENING_KM, CLOSING_KM, LITRES } = parsed.data;
  
  let RUNNING_KM: number | null = null;
  let MILEAGE: number | null = null;

  if (CLOSING_KM && CLOSING_KM >= OPENING_KM) {
    RUNNING_KM = CLOSING_KM - OPENING_KM;
    if (LITRES > 0) MILEAGE = RUNNING_KM / LITRES;
  }

  const tracking = await withTracking({
    ...parsed.data,
    RUNNING_KM,
    MILEAGE,
  }, "create");

  try {
    await prisma.fuelLog.create({
      data: tracking,
    });
  } catch {
    throw new Error("Failed to create fuel log");
  }

  revalidatePath("/fuel");
  revalidatePath("/dashboard");
  redirect("/fuel");
}

export async function updateFuelLog(id: string, formData: FormData) {
  const parsed = FuelLogSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid fuel log data: " + parsed.error.issues[0].message);
  }
  const { OPENING_KM, CLOSING_KM, LITRES } = parsed.data;

  let RUNNING_KM: number | null = null;
  let MILEAGE: number | null = null;

  if (CLOSING_KM && CLOSING_KM >= OPENING_KM) {
    RUNNING_KM = CLOSING_KM - OPENING_KM;
    if (LITRES > 0) MILEAGE = RUNNING_KM / LITRES;
  }

  const tracking = await withTracking({
    ...parsed.data,
    RUNNING_KM,
    MILEAGE,
  }, "update");

  try {
    await prisma.fuelLog.update({
      where: { id },
      data: tracking,
    });
  } catch {
    throw new Error("Failed to update fuel log");
  }

  revalidatePath("/fuel");
  revalidatePath("/dashboard");
  redirect("/fuel");
}

export async function deleteFuelLog(id: string) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.fuelLog.update({
      where: { id },
      data: tracking
    });
    revalidatePath("/fuel");
    revalidatePath("/dashboard");
  } catch {
    throw new Error("Failed to delete fuel log");
  }
}
