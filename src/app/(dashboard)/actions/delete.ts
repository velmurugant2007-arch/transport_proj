"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withTracking } from "@/lib/tracking";

export async function bulkDeleteVehicles(ids: string[]) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.vehicle.updateMany({
      where: { id: { in: ids } },
      data: tracking
    });
    revalidatePath("/vehicles");
    revalidatePath("/documents");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function bulkDeleteStudents(ids: string[]) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.student.updateMany({
      where: { id: { in: ids } },
      data: tracking
    });
    revalidatePath("/students");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function bulkDeleteRoutes(ids: string[]) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.route.updateMany({
      where: { id: { in: ids } },
      data: tracking
    });
    revalidatePath("/routes");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function bulkDeleteFuelLogs(ids: string[]) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.fuelLog.updateMany({
      where: { id: { in: ids } },
      data: tracking
    });
    revalidatePath("/fuel");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function bulkDeleteMaintenanceLogs(ids: string[]) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.maintenanceLog.updateMany({
      where: { id: { in: ids } },
      data: tracking
    });
    revalidatePath("/maintenance");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function bulkDeleteExpenses(ids: string[]) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.expense.updateMany({
      where: { id: { in: ids } },
      data: tracking
    });
    revalidatePath("/expenses");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function bulkDeleteRegistryRecords(ids: string[]) {
  try {
    await prisma.transportRecord.deleteMany({
      where: { id: { in: ids } }
    });
    revalidatePath("/registry");
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
