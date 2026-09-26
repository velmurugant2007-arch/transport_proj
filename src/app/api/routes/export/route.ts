import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { NAME: "asc" },
      include: {
        stops: {
          orderBy: { ORDER: "asc" },
        },
      },
    });

    // Flatten stops into rows
    const rows: any[] = [];
    routes.forEach((route) => {
      if (route.stops.length === 0) {
        rows.push({
          "ROUTE NAME":      route.NAME,
          "ROUTE DESC":      route.DESCRIPTION || "-",
          "BOARDING POINT":  "-",
          "SEQUENCE":        "-",
          "TIMING":          route.TIMING || "-",
          "FEE AMOUNT":      "-",
          "DISTANCE (KM)":   route.DISTANCE || "0",
        });
      } else {
        route.stops.forEach((stop) => {
          rows.push({
            "ROUTE NAME":      route.NAME,
            "ROUTE DESC":      route.DESCRIPTION || "-",
            "BOARDING POINT":  stop.NAME,
            "SEQUENCE":        stop.ORDER,
            "TIMING":          stop.TIMING || "-",
            "FEE AMOUNT":      stop.AMOUNT || 0,
            "DISTANCE (KM)":   stop.DISTANCE || 0,
          });
        });
      }
    });

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=routes_export_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export routes" }, { status: 500 });
  }
}
