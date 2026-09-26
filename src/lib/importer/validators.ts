import { z } from "zod";
import { 
  VehicleSchema, 
  StudentSchema, 
  FuelLogSchema, 
  MaintenanceLogSchema, 
  ExpenseSchema, 
  RouteSchema,
  TransportRecordSchema
} from "@/lib/validations";

const schemas = {
  vehicles: VehicleSchema,
  students: StudentSchema,
  fuel: FuelLogSchema,
  maintenance: MaintenanceLogSchema,
  expenses: ExpenseSchema,
  routes: RouteSchema,
  registry: TransportRecordSchema,
};

export type ValidationResult = {
  success: boolean;
  data?: any;
  errors?: string[];
};

/**
 * Validates a normalized row against the appropriate module schema.
 */
export function validateRow(data: any, module: keyof typeof schemas): ValidationResult {
  const schema = schemas[module];
  
  // Custom pre-processing for types that Zod might be strict about
  const processed = { ...data };
  
  // Ensure numeric fields are actually numbers
  const numericFields: Record<string, string[]> = {
    vehicles: ["CAPACITY"],
    fuel: ["LITRES", "AMOUNT", "OPENING_KM", "CLOSING_KM"],
    maintenance: ["AMOUNT"],
    expenses: ["AMOUNT"],
    routes: ["DISTANCE"],
    registry: ["AMOUNT"],
    students: ["AMOUNT"]
  };

  if (numericFields[module]) {
    for (const field of numericFields[module]) {
      if (processed[field] !== undefined && processed[field] !== null) {
        const val = parseFloat(processed[field]);
        processed[field] = isNaN(val) ? undefined : val;
      }
    }
  }

  // Ensure string fields are strings (xlsx might return numbers for identifiers)
  const stringFields: Record<string, string[]> = {
    students: ["SERIAL_NUMBER", "REGISTER_NUMBER", "CHALLAN_NUMBER", "ORDER", "BUNCH", "BUS_NUMBER", "BUS_REG_NUMBER", "YEAR", "DEGREE", "BRANCH", "AREA", "BOARDING_POINT"],
    registry: ["SERIAL_NUMBER", "REGISTER_NUMBER", "CHALLAN_NUMBER", "ORDER", "BUNCH", "BUS_NUMBER", "BUS_REG_NUMBER", "YEAR", "DEGREE", "BRANCH", "BOARDING_POINT", "ROUTE_SECTOR"],
    vehicles: ["BUS_NUMBER", "REGISTER_NUMBER", "CHASSIS_NUMBER", "DRIVER_NAME", "DRIVER_PHONE"],
    fuel: ["INDENT_NUMBER", "FUEL_TYPE"],
    maintenance: ["SERVICE_TYPE", "SERVICE_CENTER", "NOTES"],
    routes: ["NAME", "TIMING", "DESCRIPTION"]
  };

  if (stringFields[module]) {
    for (const field of stringFields[module]) {
      if (processed[field] !== undefined && processed[field] !== null) {
        let val = String(processed[field]).trim();
        // Specific sanitization for IDs and registration numbers
        if (field.includes("NUMBER") || field.includes("REGISTER") || field.includes("CHALLAN")) {
          val = val.replace(/[\n\r\t]/g, "").replace(/\s+/g, "");
        }
        processed[field] = val;
      }
    }
  }

  // Ensure date fields are Date objects
  const dateFields: Record<string, string[]> = {
    fuel: ["DATE"],
    maintenance: ["DATE", "NEXT_SERVICE_DATE"],
    expenses: ["DATE"],
    registry: ["PAYMENT_DATE"]
  };

  if (dateFields[module]) {
    for (const field of dateFields[module]) {
      if (processed[field]) {
        const d = new Date(processed[field]);
        processed[field] = isNaN(d.getTime()) ? new Date() : d;
      }
    }
  }

  // Handle fuel type normalization and defaults
  if (module === "vehicles" || module === "fuel") {
    if (processed.FUEL_TYPE) {
      const ft = String(processed.FUEL_TYPE).toUpperCase().trim();
      if (ft.includes("DIESEL")) processed.FUEL_TYPE = "DIESEL";
      else if (ft.includes("CNG")) processed.FUEL_TYPE = "CNG";
      else if (ft.includes("PETROL")) processed.FUEL_TYPE = "DIESEL"; // Map petrol to diesel as fallback or handle separately
      else processed.FUEL_TYPE = "NOT_ALLOCATED";
    } else {
      processed.FUEL_TYPE = module === "fuel" ? "DIESEL" : "NOT_ALLOCATED";
    }

    if (module === "fuel" && (processed.OPENING_KM === undefined || processed.OPENING_KM === null)) {
      processed.OPENING_KM = 0;
    }
  }

  // Handle vehicle status normalization
  if (module === "vehicles") {
    if (processed.STATUS) {
      const st = String(processed.STATUS).toUpperCase().trim();
      if (st.includes("ACTIVE") || st.includes("RUNNING")) processed.STATUS = "ACTIVE";
      else if (st.includes("MAINTENANCE") || st.includes("SERVICE") || st.includes("REPAIR")) processed.STATUS = "MAINTENANCE";
      else if (st.includes("INACTIVE") || st.includes("OFF")) processed.STATUS = "INACTIVE";
      else if (st.includes("BROKEN") || st.includes("ACCIDENT")) processed.STATUS = "BROKEN DOWN";
      else processed.STATUS = "ACTIVE";
    } else {
      processed.STATUS = "ACTIVE";
    }
  }

  // Ensure all strings are trimmed before validation
  for (const [key, value] of Object.entries(processed)) {
    if (typeof value === "string") {
      processed[key] = value.trim();
    }
  }

  // Handle array conversion for routes
  if (module === "routes" && typeof processed.boardingPoints === "string") {
    processed.boardingPoints = processed.boardingPoints
      .split(",")
      .map((p: string) => ({
        NAME: p.trim(),
        AMOUNT: 0,
        DISTANCE: 0,
        TIMING: null
      }))
      .filter((p: any) => p.NAME);
  }

  const result = (schema as any).safeParse(processed);
  
  if (!result.success) {
    console.error(`VALIDATION_ERROR [${module}]:`, result.error.format());
    const errorMessages = result.error.issues.map((e: any) => {
      const field = e.path?.join(".") || "field";
      return `${field}: ${e.message}`;
    });

    return {
      success: false,
      errors: errorMessages.length > 0 ? errorMessages : ["Schema validation failed with unknown error"]
    };
  }

  return {
    success: true,
    data: result.data
  };
}
