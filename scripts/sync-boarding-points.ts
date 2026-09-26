import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Boarding Point Synchronization...");

  // Find students who have a routeId and boardingPoint name but no boardingPointId
  const students = await prisma.student.findMany({
    where: {
      routeId: { not: null },
      boardingPointId: null,
      BOARDING_POINT: { not: null },
    },
    include: {
      route: {
        include: {
          stops: true,
        },
      },
    },
  });

  console.log(`🔍 Found ${students.length} students with pending stop allocation.`);

  let updatedCount = 0;

  for (const student of students) {
    if (!student.route || !student.BOARDING_POINT) continue;

    // Find a stop in that route that matches the student's boardingPoint name
    const matchingStop = student.route.stops.find(
      (s: { NAME: string }) => s.NAME.toLowerCase().trim() === student.BOARDING_POINT?.toLowerCase().trim()
    );

    if (matchingStop) {
      await prisma.student.update({
        where: { id: student.id },
        data: { boardingPointId: matchingStop.id },
      });
      console.log(`✅ Linked student ${student.STUDENT_NAME} to stop ${matchingStop.NAME}`);
      updatedCount++;
    } else {
      console.log(`⚠️ No matching stop found for student ${student.STUDENT_NAME} at "${student.BOARDING_POINT}" in route ${student.route.NAME}`);
    }
  }

  console.log(`\n🎉 Synchronization complete. ${updatedCount} records repaired.`);
}

main()
  .catch((e) => {
    console.error("❌ Error during synchronization:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
