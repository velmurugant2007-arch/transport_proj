"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StudentSchema } from "@/lib/validations";
import { withTracking } from "@/lib/tracking";

function parseFormData(formData: FormData) {
  return {
    STUDENT_NAME:    formData.get("name"),
    REGISTER_NUMBER: formData.get("registerNumber"),
    SERIAL_NUMBER:   formData.get("serialNumber"),
    YEAR:            formData.get("year"),
    DEGREE:          formData.get("degree"),
    BRANCH:          formData.get("branch"),
    AREA:            formData.get("area"),
    BOARDING_POINT:  formData.get("boardingPoint"),
    BUS_NUMBER:      formData.get("busNumber"),
    BUS_REG_NUMBER:  formData.get("busRegNumber"),
    AMOUNT:          formData.get("amount"),
    CHALLAN_NUMBER:  formData.get("challanNumber"),
    PAYMENT_MODE:    formData.get("paymentMode"),
    PAYMENT_DATE:    formData.get("paymentDate"),
    PAYMENT_STATUS:  formData.get("paymentStatus"),
    ORDER:           formData.get("order"),
    BUNCH:           formData.get("bunch"),
    routeId:         formData.get("routeId"),
    boardingPointId: formData.get("boardingPointId"),
    assignedBusId:  formData.get("assignedBusId"),
  };
}

export async function createStudent(formData: FormData) {
  const parsed = StudentSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid student data: " + parsed.error.issues[0].message);
  }
  
  const tracking = await withTracking(parsed.data, "create");

  try {
    const routeId = (tracking.routeId === "MANUAL" || !tracking.routeId) ? null : tracking.routeId;
    const assignedBusId = (tracking.assignedBusId === "none" || !tracking.assignedBusId) ? null : tracking.assignedBusId;
    const boardingPointId = !tracking.boardingPointId ? null : tracking.boardingPointId;

    await prisma.student.create({
      data: {
        ...tracking,
        routeId,
        boardingPointId,
        assignedBusId,
      },
    });
  } catch (err: any) {
    console.error("Student Creation Error:", err);
    if (err.code === "P2002") {
      throw new Error("A student with this Register Number already exists in the system.");
    }
    throw new Error("Failed to create student: " + (err.message || "Unknown Error"));
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
  redirect("/students");
}

export async function updateStudent(id: string, formData: FormData) {
  const parsed = StudentSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid student data: " + parsed.error.issues[0].message);
  }
  
  const tracking = await withTracking(parsed.data, "update");

  try {
    const routeId = (tracking.routeId === "MANUAL" || !tracking.routeId) ? null : tracking.routeId;
    const assignedBusId = (tracking.assignedBusId === "none" || !tracking.assignedBusId) ? null : tracking.assignedBusId;
    const boardingPointId = !tracking.boardingPointId ? null : tracking.boardingPointId;

    await prisma.student.update({
      where: { id },
      data: {
        ...tracking,
        routeId,
        boardingPointId,
        assignedBusId,
      },
    });
  } catch (err: any) {
    console.error("Student Update Error:", err);
    if (err.code === "P2002") {
      throw new Error("This Register Number is already assigned to another student.");
    }
    throw new Error("Failed to update student: " + (err.message || "Unknown Error"));
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
  redirect("/students");
}

export async function deleteStudent(id: string) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.student.update({
      where: { id },
      data: tracking
    });
    revalidatePath("/students");
    revalidatePath("/dashboard");
  } catch {
    throw new Error("Failed to delete student");
  }
}
