"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RouteSchema } from "@/lib/validations";
import { withTracking } from "@/lib/tracking";

function parseFormData(formData: FormData) {
  const stopsCount = parseInt(formData.get("stops_count") as string || "0");
  const boardingPoints = [];
  
  for (let i = 0; i < stopsCount; i++) {
    const name = formData.get(`stop_name_${i}`) as string;
    const amount = parseFloat(formData.get(`stop_amount_${i}`) as string || "0");
    const id = formData.get(`stop_id_${i}`) as string;
    const latStr = formData.get(`stop_lat_${i}`) as string;
    const lngStr = formData.get(`stop_lng_${i}`) as string;
    if (name) {
      boardingPoints.push({
        NAME: name,
        AMOUNT: amount,
        LATITUDE: latStr ? parseFloat(latStr) : null,
        LONGITUDE: lngStr ? parseFloat(lngStr) : null,
      });
    }
  }

  // Handle bus IDs (could be multiple if using a multi-select or single if using one select per bus)
  let assignedBusIds: string[] = [];
  const rawBusIds = formData.get("assignedBusIds");
  if (rawBusIds) {
    try {
      assignedBusIds = JSON.parse(rawBusIds as string);
    } catch {
      assignedBusIds = [rawBusIds as string];
    }
  }

  return {
    NAME:           formData.get("name"),
    DESCRIPTION:    formData.get("description"),
    DISTANCE:       formData.get("distance"),
    TIMING:         formData.get("timing"),
    assignedBusIds,
    boardingPoints,
  };
}

export async function createRoute(formData: FormData) {
  const parsed = RouteSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid route data: " + parsed.error.issues[0].message);
  }
  const { assignedBusIds, boardingPoints, ...data } = parsed.data;
  const tracking = await withTracking(data, "create");

  try {
    await prisma.route.create({
      data: {
        ...tracking,
        assignedBuses: { connect: assignedBusIds.map((id: string) => ({ id })) },
        stops: {
          create: boardingPoints.map((point: any, index: number) => ({
            NAME:      point.NAME,
            AMOUNT:    point.AMOUNT,
            DISTANCE:  point.DISTANCE,
            TIMING:    point.TIMING,
            LATITUDE:  point.LATITUDE,
            LONGITUDE: point.LONGITUDE,
            ORDER:     index,
          })),
        },
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create route");
  }

  revalidatePath("/routes");
  redirect("/routes");
}

export async function updateRoute(id: string, formData: FormData) {
  const parsed = RouteSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    throw new Error("Invalid route data: " + parsed.error.issues[0].message);
  }
  const { assignedBusIds, boardingPoints, ...data } = parsed.data;
  const tracking = await withTracking(data, "update");

  try {
    const updateData: any = {
      ...tracking,
      stops: {
        create: boardingPoints.map((point: any, index: number) => ({
          NAME:      point.NAME,
          AMOUNT:    point.AMOUNT,
          DISTANCE:  point.DISTANCE,
          TIMING:    point.TIMING,
          LATITUDE:  point.LATITUDE,
          LONGITUDE: point.LONGITUDE,
          ORDER:     index,
        })),
      },
    };

    // Only update assigned buses if provided, to avoid wiping existing assignments
    if (assignedBusIds && assignedBusIds.length > 0) {
      updateData.assignedBuses = { 
        set: assignedBusIds.map((bid: string) => ({ id: bid })) 
      };
    }

    await prisma.$transaction([
      // Remove existing stops
      prisma.stop.deleteMany({ where: { routeId: id } }),
      prisma.route.update({
        where: { id },
        data: updateData,
      }),
    ]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update route");
  }

  revalidatePath("/routes");
  redirect("/routes");
}

export async function deleteRoute(id: string) {
  try {
    const tracking = await withTracking({}, "delete");
    await prisma.route.update({
      where: { id },
      data: tracking
    });
    revalidatePath("/routes");
  } catch {
    throw new Error("Failed to delete route");
  }
}
