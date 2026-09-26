import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      orderBy: { STUDENT_NAME: "asc" },
      include: {
        route:       { select: { NAME: true } },
        assignedBus: { select: { BUS_NUMBER: true } },
      },
    });

    const rows = students.map((s) => ({
      "SL NO":           s.SERIAL_NUMBER || "-",
      "REG NO":           s.REGISTER_NUMBER,
      "STUDENT NAME":     s.STUDENT_NAME,
      "YEAR":             s.YEAR || "-",
      "DEGREE":           s.DEGREE || "-",
      "BRANCH":           s.BRANCH || "-",
      "BOARDING POINT":   s.BOARDING_POINT || "-",
      "BUS NO":           s.BUS_NUMBER || "-",
      "REG NO (BUS)":     s.BUS_REG_NUMBER || "-",
      "AREA":             s.AREA || "-",
      "AMOUNT":           s.AMOUNT || 0,
      "CHALLAN":          s.CHALLAN_NUMBER || "-",
      "ORDER":            s.ORDER || "-",
      "BUNCH":            s.BUNCH || "-",
      "STATUS":           s.PAYMENT_STATUS,
    }));

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=students_export_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
