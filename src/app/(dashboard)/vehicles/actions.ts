"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VehicleSchema } from "@/lib/validations";
import { withTracking } from "@/lib/tracking";

function parseFormData(formData: FormData) {
  return {
    BUS_NUMBER:         formData.get("number"),
    REGISTER_NUMBER:    formData.get("registrationNumber"),
    FUEL_TYPE:          formData.get("fuelType"),
    MAKE:               formData.get("make"),
    MODEL:              formData.get("model"),
    CAPACITY:           formData.get("capacity"),
    DRIVER_NAME:        formData.get("driverName"),
    DRIVER_PHONE:       formData.get("driverPhone"),
    STATUS:             formData.get("status"),
  };
}

export async function createVehicle(formData: FormData) {
  const parsed = VehicleSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid vehicle data: " + parsed.error.issues[0].message);
  }
  
  const tracking = await withTracking({
    ...parsed.data,
    MAKE: parsed.data.MAKE ?? "",
    MODEL: parsed.data.MODEL ?? "",
  }, "create");

  try {
    await prisma.vehicle.create({
      data: tracking,
    });
  } catch {
    throw new Error("Failed to create vehicle");
  }

  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function updateVehicle(id: string, formData: FormData) {
  const parsed = VehicleSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid vehicle data: " + parsed.error.issues[0].message);
  }
  
  const tracking = await withTracking({
    ...parsed.data,
    MAKE: parsed.data.MAKE ?? "",
    MODEL: parsed.data.MODEL ?? "",
  }, "update");

  try {
    await prisma.vehicle.update({
      where: { id },
      data: tracking,
    });

    // Synchronize Student records with the new registration number
    await prisma.student.updateMany({
      where: { assignedBusId: id },
      data: { BUS_REG_NUMBER: tracking.REGISTER_NUMBER }
    });
  } catch {
    throw new Error("Failed to update vehicle");
  }

  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function deleteVehicle(id: string) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.vehicle.update({
      where: { id },
      data: tracking
    });
    revalidatePath("/vehicles");
    revalidatePath("/dashboard");
  } catch {
    throw new Error("Failed to delete vehicle");
  }
}
