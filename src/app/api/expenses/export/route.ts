import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: { deletedAt: null },
      orderBy: { DATE: "desc" },
      include: { vehicles: { select: { BUS_NUMBER: true } } },
    });

    const rows = expenses.map((e) => ({
      "EXPENSE DATE":   e.DATE.toLocaleDateString("en-IN"),
      "EXPENSE TYPE":   e.TYPE,
      "AMOUNT (₹)":     e.AMOUNT.toFixed(2),
      "VEHICLES":       e.vehicles.map(v => v.BUS_NUMBER).join(", ") || "-",
      "NOTES":          e.NOTES ?? "-",
    }));

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=expenses_export_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
