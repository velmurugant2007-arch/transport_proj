const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const studentCount = await prisma.student.count();
  const vehicleCount = await prisma.vehicle.count();
  const routeCount = await prisma.route.count();
  const fuelCount = await prisma.fuelLog.count();
  const maintenanceCount = await prisma.maintenanceLog.count();
  const expenseCount = await prisma.expense.count();

  console.log({
    students: studentCount,
    vehicles: vehicleCount,
    routes: routeCount,
    fuel: fuelCount,
    maintenance: maintenanceCount,
    expenses: expenseCount
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
