import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StudentEditForm } from "@/modules/students";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [student, routes, vehicles] = await Promise.all([
    prisma.student.findUnique({ where: { id } }),
    prisma.route.findMany({ 
      select: { 
        id: true, 
        NAME: true,
        stops: { select: { id: true, NAME: true, AMOUNT: true } }
      }, 
      orderBy: { NAME: "asc" } 
    }),
    prisma.vehicle.findMany({ select: { id: true, BUS_NUMBER: true, CAPACITY: true }, orderBy: { BUS_NUMBER: "asc" } }),
  ]);
  if (!student) notFound();
  return <StudentEditForm student={student} routes={routes as any} vehicles={vehicles} />;
}
