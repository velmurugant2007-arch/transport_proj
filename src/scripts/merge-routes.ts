import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function mergeRoutes() {
  console.log("Starting route merger...");

  const allRoutes = await prisma.route.findMany({
    include: {
      stops: true,
      students: true,
      assignedBuses: true,
    }
  });

  const groups = allRoutes.reduce((acc, route) => {
    const name = route.NAME.trim().toLowerCase();
    if (!acc[name]) acc[name] = [];
    acc[name].push(route);
    return acc;
  }, {} as Record<string, typeof allRoutes>);

  for (const [name, routes] of Object.entries(groups)) {
    if (routes.length <= 1) continue;

    console.log(`Merging ${routes.length} instances of route: "${name}"`);
    const [master, ...duplicates] = routes;

    for (const duplicate of duplicates) {
      // 1. Move stops
      await prisma.stop.updateMany({
        where: { routeId: duplicate.id },
        data: { routeId: master.id }
      });

      // 2. Move students
      await prisma.student.updateMany({
        where: { routeId: duplicate.id },
        data: { routeId: master.id }
      });

      // 3. Move bus associations
      if (duplicate.assignedBuses.length > 0) {
        await prisma.route.update({
          where: { id: master.id },
          data: {
            assignedBuses: {
              connect: duplicate.assignedBuses.map(b => ({ id: b.id }))
            }
          }
        });
      }

      // 4. Delete duplicate
      await prisma.route.delete({ where: { id: duplicate.id } });
    }
  }

  console.log("Merge completed successfully.");
}

mergeRoutes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
