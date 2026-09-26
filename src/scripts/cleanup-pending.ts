import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL);
  
  try {
    const studentCount = await prisma.student.count();
    const vehicleCount = await prisma.vehicle.count();
    const routeCount = await prisma.route.count();
    
    console.log("Data Stats:", {
      students: studentCount,
      vehicles: vehicleCount,
      routes: routeCount
    });

    if (routeCount > 0) {
      const sampleRoutes = await prisma.route.findMany({ take: 3 });
      console.log("Sample Routes:", JSON.stringify(sampleRoutes, null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
