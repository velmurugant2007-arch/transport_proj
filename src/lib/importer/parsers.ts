import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedRow = Record<string, any>;

/**
 * Normalizes a header string by removing BOM, trimming, and lowercasing.
 */
export function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Universal parser for CSV, XLSX, and XLS files.
 */
export async function parseFile(file: File): Promise<ParsedRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return parseCSV(file);
  } else if (extension === "xlsx" || extension === "xls") {
    return parseExcel(file);
  } else {
    throw new Error(`Unsupported file type: .${extension}`);
  }
}

async function parseCSV(file: File): Promise<ParsedRow[]> {
  const text = await file.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: normalizeHeader,
      complete: (results) => resolve(results.data as ParsedRow[]),
      error: (error: Error) => reject(error),
    });
  });
}

async function parseExcel(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert to JSON with raw headers first
  const rawData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
  
  // Manually normalize headers for Excel data
  return (rawData || []).map(row => {
    const normalizedRow: ParsedRow = {};
    if (row && typeof row === "object") {
      for (const [key, value] of Object.entries(row)) {
        normalizedRow[normalizeHeader(key)] = value;
      }
    }
    return normalizedRow;
  });
}
