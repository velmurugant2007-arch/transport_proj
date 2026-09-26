"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ExpenseSchema } from "@/lib/validations";
import { withTracking } from "@/lib/tracking";

function parseFormData(formData: FormData) {
  return {
    TYPE:       formData.get("type"),
    AMOUNT:     formData.get("amount"),
    DATE:       formData.get("date"),
    vehicleIds: formData.getAll("vehicleIds"),
    NOTES:      formData.get("notes"),
  };
}

export async function createExpense(formData: FormData) {
  const parsed = ExpenseSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid expense data: " + parsed.error.issues[0].message);
  }
  
  const { vehicleIds, ...rest } = parsed.data;
  const filteredVehicleIds = vehicleIds.filter(id => id && id.trim() !== "");
  const tracking = await withTracking(rest, "create");

  try {
    await prisma.expense.create({
      data: {
        ...tracking,
        vehicles: {
          connect: filteredVehicleIds.map(id => ({ id }))
        }
      },
    });
  } catch (error) {
    console.error("CREATE_EXPENSE_ERROR:", error);
    throw new Error("Failed to create expense: " + (error instanceof Error ? error.message : "Unknown error"));
  }

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function updateExpense(id: string, formData: FormData) {
  const parsed = ExpenseSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid expense data: " + parsed.error.issues[0].message);
  }
  
  const { vehicleIds, ...rest } = parsed.data;
  const filteredVehicleIds = vehicleIds.filter(id => id && id.trim() !== "");
  const tracking = await withTracking(rest, "update");

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        ...tracking,
        vehicles: {
          set: filteredVehicleIds.map(id => ({ id }))
        }
      },
    });
  } catch (error) {
    console.error("UPDATE_EXPENSE_ERROR:", error);
    throw new Error("Failed to update expense: " + (error instanceof Error ? error.message : "Unknown error"));
  }

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function deleteExpense(id: string) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.expense.update({
      where: { id },
      data: tracking
    });
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
  } catch {
    throw new Error("Failed to delete expense");
  }
}
