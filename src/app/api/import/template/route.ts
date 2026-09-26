import { NextRequest, NextResponse } from "next/server";
import { FIELD_MAPS } from "@/lib/importer/mappers";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module") as keyof typeof FIELD_MAPS;
  const format = searchParams.get("format") || "csv";

  if (!module || !FIELD_MAPS[module]) {
    return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  }

  const fields = Object.keys(FIELD_MAPS[module]);
  
  // Create sample data (header row + 1 empty row)
  const data = [fields];

  if (format === "csv") {
    const csvContent = data.map(row => row.join(",")).join("\n");
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${module}_sample_import.csv"`,
      },
    });
  } else if (format === "xlsx" || format === "xls") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${module}_sample_import.xlsx"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
