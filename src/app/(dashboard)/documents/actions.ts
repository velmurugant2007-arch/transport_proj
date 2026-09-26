"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VehicleDocSchema } from "@/lib/validations";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function updateVehicleDocuments(vehicleId: string, formData: FormData) {
  const raw = {
    INSURANCE_NUMBER:   formData.get("insuranceNumber"),
    INSURANCE_DUE_DATE:  formData.get("insuranceDueDate"),
    INSURANCE_EXPIRY:   formData.get("insuranceExpiry"),
    TAX_NUMBER:         formData.get("taxNumber"),
    TAX_DUE_DATE:        formData.get("taxDueDate"),
    TAX_EXPIRY:         formData.get("taxExpiry"),
    ROAD_PERMIT_NUMBER:  formData.get("roadPermitNumber"),
    ROAD_PERMIT_EXPIRY:  formData.get("roadPermitExpiry"),
    POLLUTION_NUMBER:   formData.get("pollutionNumber"),
    POLLUTION_EXPIRY:   formData.get("pollutionExpiry"),
    FC_NUMBER:          formData.get("fcNumber"),
    FC_EXPIRY:          formData.get("fcExpiry"),
  };

  const parsed = VehicleDocSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid document data: " + parsed.error.issues[0].message);
  }
  
  const session = await getServerSession(authOptions);
  const adminName = session?.user?.name || "Admin";

  try {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data:  { ...parsed.data, updatedBy: adminName },
    });
  } catch {
    throw new Error("Failed to update vehicle documents");
  }

  revalidatePath("/documents");
  revalidatePath("/notifications");
  redirect("/documents");
}
