import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET() {
  try {
    const logs = await prisma.fuelLog.findMany({
      where: { deletedAt: null },
      orderBy: { DATE: "desc" },
      include: { 
        vehicle: { 
          select: { 
            BUS_NUMBER: true, 
            REGISTER_NUMBER: true,
            FUEL_TYPE: true 
          } 
        } 
      },
    });

    const rows = logs.map((l) => ({
      "DATE":               l.DATE.toLocaleDateString("en-IN"),
      "BUS NUMBER":         l.vehicle.BUS_NUMBER,
      "REGISTER NUMBER":    l.vehicle.REGISTER_NUMBER || "-",
      "OPENING KM":         l.OPENING_KM,
      "CLOSING_KM":         l.CLOSING_KM ?? "-",
      "RUNNING KM":         l.RUNNING_KM?.toFixed(2) ?? "-",
      "MILEAGE":            l.MILEAGE?.toFixed(2)           ?? "-",
      "INDENT NUMBER":      l.INDENT_NUMBER || "-",
      "LITRES":             l.LITRES,
      "RATE":               (l.LITRES > 0 ? (l.AMOUNT / l.LITRES).toFixed(2) : "0.00"),
      "AMOUNT":             l.AMOUNT.toFixed(2),
    }));

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=fuel_logs_export_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
