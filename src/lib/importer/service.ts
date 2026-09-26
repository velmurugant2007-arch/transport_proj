import prisma from "@/lib/prisma";
import { parseFile } from "./parsers";
import { mapRow, findVehicleId, findRouteId, FIELD_MAPS } from "./mappers";
import { validateRow } from "./validators";
import { withTracking } from "../tracking";

export type ImportReport = {
  success: boolean;
  total: number;
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
};

export type ImportModule = keyof typeof FIELD_MAPS;

/**
 * Enterprise Import Service
 */
export class ImportService {
  /**
   * Main entry point for importing a file for a specific module.
   */
  static async importFile(file: File, module: ImportModule): Promise<ImportReport> {
    try {
      const rawRows = await parseFile(file);
      const report: ImportReport = {
        success: true,
        total: rawRows.length,
        imported: 0,
        failed: 0,
        errors: [],
      };

      for (let i = 0; i < rawRows.length; i++) {
        const rawRow = rawRows[i];
        const rowIndex = i + 2;

        try {
          const normalized = mapRow(rawRow, module);
          
          if (module === "students" || module === "registry") {
            let bNum = (normalized.BUS_NUMBER || "").toString().trim();
            // Use ROUTE_NAME as primary, fallback to AREA or SECTOR
            let rName = (normalized.ROUTE_NAME || normalized.AREA || normalized.ROUTE_SECTOR || "").toString().trim();
            let bPoint = (normalized.BOARDING_POINT || "").toString().trim();
            const bAmount = parseFloat(normalized.AMOUNT || "0") || 0;

            if (this.isJunkValue(bNum)) bNum = "";
            if (this.isJunkValue(rName)) rName = "";
            if (this.isJunkValue(bPoint)) bPoint = "";

            normalized.BUS_NUMBER = bNum;
            normalized.BOARDING_POINT = bPoint;

            // 1. Resolve or Create Vehicle (ONLY allowed for students/registry/vehicles)
            if (bNum) {
              const v = await prisma.vehicle.upsert({
                where: { BUS_NUMBER: bNum },
                update: { 
                  deletedAt: null,
                  REGISTER_NUMBER: normalized.BUS_REG_NUMBER || undefined
                },
                create: {
                  BUS_NUMBER: bNum,
                  REGISTER_NUMBER: normalized.BUS_REG_NUMBER || null,
                  FUEL_TYPE: "NOT_ALLOCATED",
                  CAPACITY: 0,
                  STATUS: "ACTIVE",
                  createdBy: "STUDENT_IMPORT_AUTO",
                  deletedAt: null
                }
              });
              normalized.assignedBusId = v.id;
            }

            // 2. Resolve or Create Route
            if (rName) {
              let r = await prisma.route.findFirst({ where: { NAME: rName } });
              if (!r) {
                r = await prisma.route.create({
                  data: {
                    NAME: rName,
                    createdBy: "STUDENT_IMPORT_AUTO",
                    deletedAt: null
                  }
                });
              } else if (r.deletedAt) {
                // Restore deleted route
                await prisma.route.update({ where: { id: r.id }, data: { deletedAt: null } });
              }
              normalized.routeId = r.id;

              // 3. Resolve or Create Boarding Point (Stop)
              if (bPoint && r.id) {
                let stop = await prisma.stop.findFirst({
                  where: { NAME: bPoint, routeId: r.id }
                });
                
                if (!stop) {
                  stop = await prisma.stop.create({
                    data: { NAME: bPoint, routeId: r.id, ORDER: 99, AMOUNT: bAmount }
                  });
                }
                normalized.boardingPointId = stop.id;
              }
            }

            // 4. Link Vehicle to Route
            if (normalized.assignedBusId && normalized.routeId) {
              await prisma.route.update({
                where: { id: normalized.routeId },
                data: { assignedBuses: { connect: { id: normalized.assignedBusId } } }
              });
            }
          } else if (["fuel", "maintenance", "expenses"].includes(module)) {
            // STRICT LOOKUP: No auto-creation for these modules
            const lookupValue = (normalized.BUS_NUMBER_LOOKUP || "").toString().trim();
            
            if (module === "expenses") {
              // Expenses can have multiple buses separated by comma
              const busIdentifiers = lookupValue.split(/[,\s]+/).filter(Boolean);
              const foundIds: string[] = [];
              
              for (const ident of busIdentifiers) {
                const vId = await findVehicleId(ident);
                if (vId) foundIds.push(vId);
              }
              
              if (foundIds.length === 0 && lookupValue) {
                throw new Error(`Could not identify any valid vehicles from: "${lookupValue}"`);
              }
              normalized.vehicleIds = foundIds;
            } else {
              const vId = await findVehicleId(lookupValue);
              if (!vId && lookupValue) {
                throw new Error(`Vehicle "${lookupValue}" not found. Create vehicle first in Bus Management.`);
              }
              normalized.vehicleId = vId;
            }
          }

          const validation = validateRow(normalized, module);
          if (!validation.success) {
            throw new Error(validation.errors?.join("; ") || "Schema validation failed");
          }

          await this.saveToDb(validation.data, module);
          report.imported++;
        } catch (err: any) {
          report.failed++;
          report.errors.push({ row: rowIndex, message: err.message });
        }
      }

      // Final Infrastructure Reconciliation (Deep Sync)
      if (module === "students" || module === "registry") {
        const activeRoutes = await prisma.route.findMany({
          where: { deletedAt: null },
          include: { students: { where: { deletedAt: null, assignedBusId: { not: null } } } }
        });

        for (const route of activeRoutes) {
          const distinctBusIds = [...new Set(route.students.map(s => s.assignedBusId).filter(Boolean))] as string[];
          await prisma.route.update({
            where: { id: route.id },
            data: {
              assignedBuses: {
                set: distinctBusIds.map(id => ({ id }))
              }
            }
          });
        }
      }

      return report;
    } catch (err: any) {
      return {
        success: false,
        total: 0,
        imported: 0,
        failed: 0,
        errors: [{ row: 0, message: err.message }],
      };
    }
  }

  private static async saveToDb(data: any, module: ImportModule) {
    const { BUS_NUMBER_LOOKUP, ...dbData } = data;
    
    let existingId: string | null = null;
    if (module === "vehicles") {
      const v = await prisma.vehicle.findUnique({ where: { BUS_NUMBER: dbData.BUS_NUMBER } });
      if (v) existingId = v.id;
    } else if (module === "students") {
      const s = await prisma.student.findUnique({ where: { REGISTER_NUMBER: dbData.REGISTER_NUMBER } });
      if (s) existingId = s.id;
    }

    const tracking = {
      ...(await withTracking(dbData, existingId ? "update" : "create")),
      deletedAt: null,
    };

    switch (module) {
      case "vehicles":
        await prisma.vehicle.upsert({
          where: { BUS_NUMBER: dbData.BUS_NUMBER },
          update: tracking,
          create: tracking,
        });
        break;
      case "students":
        await prisma.student.upsert({
          where: { REGISTER_NUMBER: dbData.REGISTER_NUMBER },
          update: tracking,
          create: tracking,
        });
        break;
      case "fuel":
        if (tracking.OPENING_KM && tracking.CLOSING_KM) {
          tracking.RUNNING_KM = tracking.CLOSING_KM - tracking.OPENING_KM;
          if (tracking.LITRES > 0) {
            tracking.MILEAGE = tracking.RUNNING_KM / tracking.LITRES;
          }
        }
        await prisma.fuelLog.create({ data: tracking as any });
        break;
      case "maintenance":
        await prisma.maintenanceLog.create({ data: tracking as any });
        if (tracking.SERVICE_TYPE === "Breakdown") {
          await prisma.vehicle.update({
            where: { id: tracking.vehicleId },
            data: { STATUS: "MAINTENANCE" }
          });
        }
        break;
      case "expenses":
        const { vehicleIds = [], ...expenseData } = tracking;
        await prisma.expense.create({ 
          data: { 
            ...expenseData,
            vehicles: { connect: (vehicleIds as string[]).map(id => ({ id })) }
          } 
        });
        break;
      case "routes":
        const { boardingPoints = [], assignedBusIds = [], ...routeData } = tracking as any;
        let route = await prisma.route.findFirst({ where: { NAME: routeData.NAME } });
        
        if (route) {
          route = await prisma.route.update({
            where: { id: route.id },
            data: { ...routeData, deletedAt: null }
          });
        } else {
          route = await prisma.route.create({ data: routeData });
        }

        if (boardingPoints.length > 0) {
          // Merge stops instead of total deletion to preserve student references
          for (let i = 0; i < boardingPoints.length; i++) {
            const p = boardingPoints[i];
            const pName = typeof p === "string" ? p.trim() : p.NAME;
            if (!pName) continue;

            const stopData = {
              NAME: pName,
              ORDER: i + 1,
              AMOUNT: typeof p === "object" ? p.AMOUNT || 0 : 0,
              DISTANCE: typeof p === "object" ? p.DISTANCE || 0 : 0,
              TIMING: typeof p === "object" ? p.TIMING || null : null,
              routeId: route.id
            };

            await prisma.stop.upsert({
              where: { 
                routeId_NAME: { routeId: route.id, NAME: pName } 
              },
              update: stopData,
              create: stopData
            });
          }
        }
        break;
      case "registry":
        await prisma.transportRecord.create({ data: tracking });
        await this.syncRegistryToCore(tracking);
        break;
    }
  }

  private static isJunkValue(val: any): boolean {
    if (val === undefined || val === null) return true;
    const s = val.toString().trim().toLowerCase();
    if (["nil", "none", "n/a", "null", "undefined", "empty", "no"].includes(s)) return true;
    if (s.length === 1 && !/[a-z0-9]/i.test(s)) return true;
    return s === "";
  }

  private static async syncRegistryToCore(data: any) {
    const { BUS_NUMBER, AREA, BOARDING_POINT, ROUTE_SECTOR, importBatchId, syncStatus, ...registryData } = data;
    
    let vehicleId = null;
    const bNum = (BUS_NUMBER || "").toString().trim();
    if (!this.isJunkValue(bNum)) {
      vehicleId = await findVehicleId(bNum);
      if (!vehicleId) {
        const v = await prisma.vehicle.upsert({
          where: { BUS_NUMBER: bNum },
          update: { 
            deletedAt: null,
            REGISTER_NUMBER: registryData.BUS_REG_NUMBER || undefined
          },
          create: { 
            BUS_NUMBER: bNum,
            REGISTER_NUMBER: registryData.BUS_REG_NUMBER || null,
            FUEL_TYPE: "DIESEL",
            CAPACITY: 50,
            STATUS: "ACTIVE",
            createdBy: "SYSTEM_SYNC"
          }
        });
        vehicleId = v.id;
      }
    }

    const rName = (AREA || ROUTE_SECTOR || "").toString().trim();
    let routeId = await findRouteId(rName);
    if (!routeId && rName) {
      const r = await prisma.route.upsert({
        where: { NAME: rName },
        update: { deletedAt: null },
        create: { NAME: rName, createdBy: "SYSTEM_SYNC" }
      });
      routeId = r.id;
    }

    let stopId: string | null = null;
    if (BOARDING_POINT && routeId) {
      const stop = await prisma.stop.upsert({
        where: { routeId_NAME: { routeId: routeId, NAME: BOARDING_POINT } },
        update: {},
        create: { NAME: BOARDING_POINT, routeId: routeId, ORDER: 99 }
      });
      stopId = stop.id;
    }

    await prisma.student.upsert({
      where: { REGISTER_NUMBER: registryData.REGISTER_NUMBER },
      update: {
        ...registryData,
        STUDENT_NAME: registryData.STUDENT_NAME || registryData.NAME,
        BOARDING_POINT: BOARDING_POINT,
        BUS_NUMBER: BUS_NUMBER,
        assignedBusId: vehicleId,
        routeId: routeId,
        boardingPointId: stopId,
        deletedAt: null
      },
      create: {
        ...registryData,
        STUDENT_NAME: registryData.STUDENT_NAME || registryData.NAME,
        BOARDING_POINT: BOARDING_POINT,
        BUS_NUMBER: BUS_NUMBER,
        assignedBusId: vehicleId,
        routeId: routeId,
        boardingPointId: stopId,
        deletedAt: null
      }
    });
  }
}
