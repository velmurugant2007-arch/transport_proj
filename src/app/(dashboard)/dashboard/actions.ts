"use server";

import prisma from "@/lib/prisma";

export async function calculateTotalExpense(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const [fuel, maintenance, misc] = await Promise.all([
    prisma.fuelLog.aggregate({
      _sum: { AMOUNT: true },
      where: { DATE: { gte: start, lte: end }, deletedAt: null }
    }),
    prisma.maintenanceLog.aggregate({
      _sum: { AMOUNT: true },
      where: { DATE: { gte: start, lte: end }, deletedAt: null }
    }),
    prisma.expense.aggregate({
      _sum: { AMOUNT: true },
      where: { DATE: { gte: start, lte: end }, deletedAt: null }
    })
  ]);

  const vehicleCount = await prisma.vehicle.count({ where: { deletedAt: null } });

  return {
    fuel: fuel._sum.AMOUNT || 0,
    maintenance: maintenance._sum.AMOUNT || 0,
    misc: misc._sum.AMOUNT || 0,
    total: (fuel._sum.AMOUNT || 0) + (maintenance._sum.AMOUNT || 0) + (misc._sum.AMOUNT || 0),
    vehicleCount
  };
}

export async function calculateIndividualExpense(vehicleId: string, startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const [fuel, maintenance, misc] = await Promise.all([
    prisma.fuelLog.aggregate({
      _sum: { AMOUNT: true },
      where: { vehicleId, DATE: { gte: start, lte: end }, deletedAt: null }
    }),
    prisma.maintenanceLog.aggregate({
      _sum: { AMOUNT: true },
      where: { vehicleId, DATE: { gte: start, lte: end }, deletedAt: null }
    }),
    prisma.expense.aggregate({
      _sum: { AMOUNT: true },
      where: { 
        vehicles: { some: { id: vehicleId } }, 
        DATE: { gte: start, lte: end },
        deletedAt: null 
      }
    })
  ]);

  return {
    fuel: fuel._sum.AMOUNT || 0,
    maintenance: maintenance._sum.AMOUNT || 0,
    misc: misc._sum.AMOUNT || 0,
    total: (fuel._sum.AMOUNT || 0) + (maintenance._sum.AMOUNT || 0) + (misc._sum.AMOUNT || 0)
  };
}
