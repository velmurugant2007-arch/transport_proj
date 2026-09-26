"use server";

import { revalidatePath } from "next/cache";
import { ImportService, ImportModule } from "@/lib/importer/service";

/**
 * Universal Bulk Import Server Action
 */
async function performImport(formData: FormData, module: ImportModule, redirectPath: string) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, message: "No file uploaded" };

  const report = await ImportService.importFile(file, module);
  
  // Revalidate both the current module and the dashboard stats
  revalidatePath(redirectPath);
  revalidatePath("/dashboard");
  revalidatePath("/", "layout"); // Deep revalidation to catch all related components
  
  if (!report.success) {
    return { success: false, message: report.errors[0]?.message || "Import failed" };
  }

  const message = `Import complete: ${report.imported} successful, ${report.failed} failed.`;
  return { 
    success: report.failed === 0, 
    count: report.imported, 
    message,
    errors: report.errors 
  };
}

export async function bulkImportVehicles(formData: FormData) {
  return performImport(formData, "vehicles", "/vehicles");
}

export async function bulkImportStudents(formData: FormData) {
  return performImport(formData, "students", "/students");
}

export async function bulkImportRoutes(formData: FormData) {
  return performImport(formData, "routes", "/routes");
}

export async function bulkImportFuel(formData: FormData) {
  return performImport(formData, "fuel", "/fuel");
}

export async function bulkImportMaintenance(formData: FormData) {
  return performImport(formData, "maintenance", "/maintenance");
}

export async function bulkImportExpenses(formData: FormData) {
  return performImport(formData, "expenses", "/expenses");
}

export async function bulkImportRegistry(formData: FormData) {
  return performImport(formData, "registry", "/registry");
}
