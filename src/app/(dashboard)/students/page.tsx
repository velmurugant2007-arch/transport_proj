import prisma from "@/lib/prisma";
import { StudentList } from "@/modules/students";
export const dynamic = "force-dynamic";

export default async function StudentsPage({ searchParams }: { searchParams: { busNumber?: string, routeId?: string, boardingPointId?: string } }) {
  const { busNumber, routeId, boardingPointId } = await searchParams;
  
  const students = await prisma.student.findMany({
    where: { 
      deletedAt: null,
      ...(busNumber ? { BUS_NUMBER: busNumber } : {}),
      ...(routeId ? { routeId } : {}),
      ...(boardingPointId ? { boardingPointId } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: { route: true, assignedBus: true },
  });
  return <StudentList students={students} />;
}
