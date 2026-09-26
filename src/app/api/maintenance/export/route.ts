import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET() {
  try {
    const records = await prisma.maintenanceLog.findMany({
      where: { deletedAt: null },
      orderBy: { DATE: "desc" },
      include: { vehicle: { select: { BUS_NUMBER: true, FUEL_TYPE: true } } },
    });

    const rows = records.map((r) => ({
      "SERVICE DATE":      r.DATE.toLocaleDateString("en-IN"),
      "VEHICLE NUMBER":    r.vehicle.BUS_NUMBER,
      "SERVICE TYPE":      r.SERVICE_TYPE,
      "SERVICE CENTER":    r.SERVICE_CENTER  ?? "-",
      "TOTAL COST (₹)":    r.AMOUNT.toFixed(2),
      "SPARE PARTS USED":  r.SPARE_PARTS     ?? "-",
      "BREAKDOWN DETAILS": r.BREAKDOWN_DETAILS ?? "-",
      "NEXT SERVICE DATE": r.NEXT_SERVICE_DATE?.toLocaleDateString("en-IN") ?? "-",
      "ADDITIONAL NOTES":  r.NOTES          ?? "-",
    }));

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=maintenance_export_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
