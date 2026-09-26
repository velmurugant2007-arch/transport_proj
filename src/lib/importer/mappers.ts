import prisma from "@/lib/prisma";

/**
 * Mapping dictionary for various modules to normalize incoming CSV/Excel headers.
 */
export const FIELD_MAPS = {
  vehicles: {
    BUS_NUMBER: ["number", "vehiclenumber", "vehicle_number", "busnumber", "bus_number", "vehicleno", "busno", "bus_no", "bus"],
    REGISTER_NUMBER: ["registration", "regno", "registrationnumber", "register_number", "plate", "platenumber"],
    FUEL_TYPE: ["fueltype", "type", "fuel_type"],
    MAKE: ["make", "brand", "company"],
    MODEL: ["model", "variant"],
    CAPACITY: ["capacity", "seats", "totalcapacity"],
    STATUS: ["status", "state", "condition"],
    DRIVER_NAME: ["drivername", "driver", "name"],
    DRIVER_PHONE: ["driverphone", "phone", "contact", "mobile"],
  },
  students: {
    STUDENT_NAME:   ["studentname", "name", "student_name", "fullname"],
    REGISTER_NUMBER: ["registernumber", "register_number", "regno", "id", "rollno", "rollnumber"],
    SERIAL_NUMBER:   ["slno", "sno", "serialnumber", "directoryserialnumber"],
    YEAR:           ["year", "studyingyear", "yr"],
    DEGREE:         ["degree", "course"],
    BRANCH:         ["branch", "department", "dept", "specialization"],
    BOARDING_POINT:  ["boardingpoint", "stop", "pickup", "point"],
    BUS_NUMBER:      ["number", "busnumber", "busno", "vehicle", "bus", "vehiclenumber", "bus_number", "bus_no", "vehicleno", "assignedbus", "vno"],
    BUS_REG_NUMBER:   ["busregnumber", "busreg", "registration", "registrationnumber", "regno"],
    AREA:           ["area", "location", "place", "route", "routename", "routesector", "sector", "area_name", "areaname", "destination"],
    AMOUNT:         ["amount", "fee", "transportfee", "price", "fees", "busfee"],
    CHALLAN_NUMBER:  ["challannumber", "challanno", "billnumber", "billno", "challan"],
    PAYMENT_STATUS:  ["paymentstatus", "status", "paid"],
    ORDER:          ["order", "orderno", "serial"],
    BUNCH:          ["bunch", "bunchid", "bunch_id", "punch", "punchno"],
    ROUTE_NAME:      ["routename", "route", "path", "routesector", "direction"],
  },
  fuel: {
    BUS_NUMBER_LOOKUP: ["number", "bus nume", "bus_nume", "bus_number", "busnumber", "vehiclenumber", "vehicle", "bus", "busno", "bus_no", "vehicle_no", "vehicleno", "regno", "registration"],
    DATE: ["date", "fueldate", "refueldate", "refuel_date", "entry_date"],
    FUEL_TYPE: ["fueltype", "type", "fuel_type", "fuel", "class", "category"],
    LITRES: ["litres", "litres", "quantity", "qty", "liters", "fuel_qty", "amount_liters"],
    AMOUNT: ["amount", "cost", "price", "total_cost", "fuel_cost", "bill_amount"],
    OPENING_KM: ["opening", "opening_odometer", "startodometer", "start_odometer", "openingodometer", "odometer", "start_km", "opening_km", "reading", "start_reading", "initial_reading", "km_reading"],
    CLOSING_KM: ["closing km", "closing_km", "endodometer", "end_odometer", "closingodometer", "end_km", "closing_km", "end_reading", "final_reading"],
    INDENT_NUMBER: ["indent nu", "indent_nu", "indent_no", "indentnumber", "indent_number", "bill_no"],
  },
  maintenance: {
    BUS_NUMBER_LOOKUP: ["number", "vehiclenumber", "vehicle", "bus", "busnumber", "busno", "bus_no", "vehicle_no", "vehicleno", "regno", "registration"],
    DATE: ["date", "servicedate", "maintenance_date", "entry_date"],
    SERVICE_TYPE: ["servicetype", "type", "category", "maintenance_type"],
    AMOUNT: ["cost", "amount", "price", "totalcost", "service_cost"],
    SERVICE_CENTER: ["servicecenter", "center", "workshop", "garage", "vendor"],
    SPARE_PARTS: ["spareparts", "parts", "components", "spares"],
    NEXT_SERVICE_DATE: ["nextservicedate", "nextservice", "duedate", "next_due"],
    NOTES: ["notes", "additionalnotes", "remarks", "desc"],
  },
  expenses: {
    TYPE: ["type", "expensetype", "category", "purpose", "expense_type"],
    AMOUNT: ["amount", "cost", "price", "value"],
    DATE: ["date", "expensedate", "entry_date"],
    BUS_NUMBER_LOOKUP: ["number", "vehiclenumber", "vehicle", "bus", "busnumber", "busno", "bus_no", "vehicle_no", "vehicleno", "regno", "registration"],
    NOTES: ["notes", "remarks", "description", "desc"],
  },
  routes: {
    NAME: ["name", "routename", "route"],
    DISTANCE: ["distance", "km", "range"],
    TIMING: ["timing", "time", "duration"],
    DESCRIPTION: ["description", "desc", "details"],
    boardingPoints: ["boardingpoints", "stops", "busstops", "points"],
  },
  registry: {
    SERIAL_NUMBER:   ["directoryserialnumber", "serialnumber", "slno", "sno", "serial_no"],
    REGISTER_NUMBER: ["registernumber", "register_number", "regno", "id", "rollno"],
    NAME:           ["studentname", "name", "student_name", "fullname"],
    YEAR:           ["year", "studyingyear", "yr"],
    DEGREE:         ["degree", "course"],
    BRANCH:         ["branch", "specialization"],
    BOARDING_POINT:  ["boardingpoint", "stop", "pickup", "point"],
    ROUTE_SECTOR:    ["routesector", "route", "sector", "routename"],
    BUS_NUMBER:      ["number", "busnumber", "busno", "vehicle", "bus", "vehiclenumber"],
    BUS_REG_NUMBER:   ["busregnumber", "busreg", "registration", "registrationnumber", "regno"],
    AMOUNT:         ["amount", "fee", "transportfee", "price"],
    AREA:           ["area", "location", "place"],
    CHALLAN_NUMBER:  ["challannumber", "challanno", "billnumber", "billno"],
    PAYMENT_MODE:    ["paymentmode", "mode", "type"],
    PAYMENT_DATE:    ["paymentdate", "date"],
    PAYMENT_STATUS:  ["paymentstatus", "status", "paid"],
    ORDER:          ["order", "orderno", "serial"],
    BUNCH:          ["bunch", "bunchid", "bunch_id", "punch", "punchno", "hole"],
  }
};

/**
 * Normalizes a row by mapping its keys to the expected database field names.
 */
export function mapRow(row: Record<string, any>, module: keyof typeof FIELD_MAPS): Record<string, any> {
  const map = FIELD_MAPS[module];
  const normalized: Record<string, any> = {};

  // 1. Primary Mapping: Try exact normalized synonyms
  for (const [targetField, synonyms] of Object.entries(map)) {
    for (const synonym of synonyms) {
      const normalizedSynonym = synonym.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (row[normalizedSynonym] !== undefined && row[normalizedSynonym] !== null) {
        normalized[targetField] = row[normalizedSynonym];
        break;
      }
    }
  }

  // 2. Fallback: If vehicle identification is missing, search for any column that looks like a vehicle ID
  const isVehicleModule = ["fuel", "maintenance", "expenses"].includes(module);
  const targetKey = isVehicleModule ? "BUS_NUMBER_LOOKUP" : "BUS_NUMBER";
  
  if (!normalized[targetKey]) {
    const vehicleSynonyms = ["number", "bus", "vehicle", "vno", "reg"];
    const rowKeys = Object.keys(row);
    
    for (const key of rowKeys) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (vehicleSynonyms.some(s => normalizedKey.includes(s))) {
        normalized[targetKey] = row[key];
        break;
      }
    }
  }

  return normalized;
}

/**
 * Robustly finds a vehicle in the database by its identifier (Bus Number or Reg Number).
 */
export async function findVehicleId(vNum: string | undefined): Promise<string | null> {
  if (!vNum) return null;
  const cleanNum = vNum.toString().trim();
  const searchLower = cleanNum.toLowerCase();
  
  // 1. Try exact match on BUS_NUMBER
  let v = await prisma.vehicle.findUnique({ where: { BUS_NUMBER: cleanNum } });
  if (v) return v.id;

  // 2. Try exact match on REGISTER_NUMBER
  v = await prisma.vehicle.findFirst({ where: { REGISTER_NUMBER: cleanNum } });
  if (v) return v.id;

  // 3. Try case-insensitive lookup on both
  v = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { BUS_NUMBER: { equals: cleanNum } },
        { REGISTER_NUMBER: { equals: cleanNum } }
      ]
    }
  });
  if (v) return v.id;

  // 4. Try normalized lookup (no spaces, no special chars)
  const vehicles = await prisma.vehicle.findMany({ 
    select: { id: true, BUS_NUMBER: true, REGISTER_NUMBER: true },
    where: { deletedAt: null }
  });

  const matched = vehicles.find(veh => {
    const v1 = veh.BUS_NUMBER.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const r1 = (veh.REGISTER_NUMBER || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const v2 = cleanNum.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    return (v1 === v2 || r1 === v2) && v2.length > 0;
  });
  
  return matched ? matched.id : null;
}

/**
 * Finds a route by name.
 */
export async function findRouteId(rName: string | undefined): Promise<string | null> {
  if (!rName) return null;
  const cleanName = rName.toString().trim();
  
  // 1. Try exact match (case-insensitive depends on DB provider, but we'll try findFirst)
  let r = await prisma.route.findFirst({
    where: { NAME: { equals: cleanName } }
  });
  if (r) return r.id;

  // 2. Try normalized exact match
  const routes = await prisma.route.findMany({ select: { id: true, NAME: true } });
  const matched = routes.find(rt => 
    rt.NAME.replace(/\s/g, "").toLowerCase() === cleanName.replace(/\s/g, "").toLowerCase()
  );
  if (matched) return matched.id;

  // 3. Try partial match as last resort
  const rPartial = await prisma.route.findFirst({
    where: { NAME: { contains: cleanName } }
  });
  return rPartial ? rPartial.id : null;
}
