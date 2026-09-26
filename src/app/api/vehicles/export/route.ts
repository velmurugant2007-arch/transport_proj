import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { deletedAt: null },
      orderBy: { BUS_NUMBER: "asc" },
      include: {
        _count: {
          select: { students: true },
        },
        routes: {
          select: { NAME: true },
        },
      },
    });

    const rows = vehicles.map((v) => ({
      "BUS NUMBER":         v.BUS_NUMBER,
      "REGISTER NUMBER":    v.REGISTER_NUMBER || "-",
      "STATUS":             v.STATUS,
      "MAKE":               v.MAKE || "-",
      "MODEL":              v.MODEL || "-",
      "CAPACITY":           v.CAPACITY,
      "OCCUPANCY":          v._count.students,
      "FUEL TYPE":          v.FUEL_TYPE,
      "DRIVER NAME":        v.DRIVER_NAME || "-",
      "DRIVER PHONE":       v.DRIVER_PHONE || "-",
      "ASSIGNED ROUTE":     v.routes[0]?.NAME || "Not Assigned",
    }));

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=vehicles_export_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export vehicles" }, { status: 500 });
  }
}
