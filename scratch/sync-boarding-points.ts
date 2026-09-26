import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting boarding point synchronization...");
  
  // Find students that have a text boarding point but no linked boardingPointId,
  // and are assigned to a route (so we can match stops).
  const students = await prisma.student.findMany({
    where: {
      boardingPointId: null,
      BOARDING_POINT: { not: null },
      routeId: { not: null },
    },
    include: {
      route: {
        include: {
          stops: true,
        },
      },
    },
  });

  console.log(`Found ${students.length} students to process.`);

  let updatedCount = 0;

  for (const student of students) {
    if (!student.route) continue;

    const matchingStop = student.route.stops.find(
      (stop: { NAME: string }) => stop.NAME.toLowerCase() === student.BOARDING_POINT?.toLowerCase()
    );

    if (matchingStop) {
      await prisma.student.update({
        where: { id: student.id },
        data: { boardingPointId: matchingStop.id },
      });
      updatedCount++;
      console.log(`Synced ${student.STUDENT_NAME}: ${student.BOARDING_POINT} -> ${matchingStop.NAME}`);
    } else {
      console.log(`No matching stop for ${student.STUDENT_NAME}: ${student.BOARDING_POINT} in route ${student.route.NAME}`);
    }
  }

  console.log(`Synchronization complete. Updated ${updatedCount} students.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
