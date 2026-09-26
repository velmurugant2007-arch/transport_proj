import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data truncation...");

  try {
    // Correct order to handle foreign keys
    await prisma.$transaction([
      prisma.student.deleteMany(),
      prisma.transportRecord.deleteMany(),
      prisma.fuelLog.deleteMany(),
      prisma.maintenanceLog.deleteMany(),
      prisma.expense.deleteMany(),
      prisma.stop.deleteMany(),
      prisma.notification.deleteMany(),
      // Join tables and parents
      prisma.vehicle.deleteMany(),
      prisma.route.deleteMany(),
    ]);

    console.log("✅ All operational data truncated successfully.");
    console.log("Note: Admin accounts were preserved to maintain session.");
  } catch (error) {
    console.error("❌ Error truncating data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
