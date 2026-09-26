"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MaintenanceLogSchema } from "@/lib/validations";
import { withTracking } from "@/lib/tracking";

function parseFormData(formData: FormData) {
  return {
    vehicleId:         formData.get("vehicleId"),
    DATE:              formData.get("date"),
    SERVICE_TYPE:      formData.get("serviceType"),
    AMOUNT:            formData.get("cost"),
    SERVICE_CENTER:    formData.get("serviceCenter"),
    BREAKDOWN_DETAILS: formData.get("breakdownDetails"),
    SPARE_PARTS:       formData.get("spareParts"),
    NEXT_SERVICE_DATE: formData.get("nextServiceDate"),
    NOTES:             formData.get("notes"),
  };
}

export async function createMaintenanceLog(formData: FormData) {
  const parsed = MaintenanceLogSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid maintenance data: " + parsed.error.issues[0].message);
  }
  
  const tracking = await withTracking(parsed.data, "create");

  try {
    await prisma.maintenanceLog.create({ data: tracking });
    if (parsed.data.SERVICE_TYPE === "Breakdown") {
      await prisma.vehicle.update({
        where: { id: parsed.data.vehicleId },
        data:  { STATUS: "MAINTENANCE" },
      });
    }
  } catch {
    throw new Error("Failed to create maintenance log");
  }

  revalidatePath("/maintenance");
  revalidatePath("/vehicles");
  redirect("/maintenance");
}

export async function updateMaintenanceLog(id: string, formData: FormData) {
  const parsed = MaintenanceLogSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid maintenance data: " + parsed.error.issues[0].message);
  }
  
  const tracking = await withTracking(parsed.data, "update");

  try {
    await prisma.maintenanceLog.update({ where: { id }, data: tracking });
  } catch {
    throw new Error("Failed to update maintenance log");
  }

  revalidatePath("/maintenance");
  redirect("/maintenance");
}

export async function deleteMaintenanceLog(id: string) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.maintenanceLog.update({
      where: { id },
      data: tracking
    });
    revalidatePath("/maintenance");
    revalidatePath("/dashboard");
  } catch {
    throw new Error("Failed to delete maintenance log");
  }
}
