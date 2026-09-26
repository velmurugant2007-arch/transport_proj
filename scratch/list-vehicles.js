const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany();
  console.log(vehicles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
