import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { BUS_NUMBER: "asc" },
      select: {
        BUS_NUMBER: true,
        REGISTER_NUMBER: true,
        INSURANCE_NUMBER: true,
        INSURANCE_EXPIRY: true,
        TAX_NUMBER: true,
        TAX_EXPIRY: true,
        ROAD_PERMIT_NUMBER: true,
        ROAD_PERMIT_EXPIRY: true,
        POLLUTION_NUMBER: true,
        POLLUTION_EXPIRY: true,
        FC_NUMBER: true,
        FC_EXPIRY: true,
      },
    });

    const rows = vehicles.map((v) => ({
      "BUS NUMBER":         v.BUS_NUMBER,
      "REGISTER NUMBER":    v.REGISTER_NUMBER || "-",
      "INSURANCE NO":       v.INSURANCE_NUMBER    || "-",
      "INSURANCE EXPIRY":   v.INSURANCE_EXPIRY ? v.INSURANCE_EXPIRY.toLocaleDateString("en-IN") : "-",
      "ROAD TAX NO":        v.TAX_NUMBER         || "-",
      "ROAD TAX EXPIRY":    v.TAX_EXPIRY       ? v.TAX_EXPIRY.toLocaleDateString("en-IN")    : "-",
      "PERMIT NO":          v.ROAD_PERMIT_NUMBER  || "-",
      "PERMIT EXPIRY":      v.ROAD_PERMIT_EXPIRY ? v.ROAD_PERMIT_EXPIRY.toLocaleDateString("en-IN") : "-",
      "POLLUTION NO":       v.POLLUTION_NUMBER   || "-",
      "POLLUTION EXPIRY":   v.POLLUTION_EXPIRY  ? v.POLLUTION_EXPIRY.toLocaleDateString("en-IN")  : "-",
      "FC NO":              v.FC_NUMBER          || "-",
      "FC EXPIRY":          v.FC_EXPIRY         ? v.FC_EXPIRY.toLocaleDateString("en-IN")         : "-",
    }));

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=documents_export_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export documents" }, { status: 500 });
  }
}
