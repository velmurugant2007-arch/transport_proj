import prisma from "@/lib/prisma";
import { StudentForm } from "@/modules/students";
export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const [routes, vehicles] = await Promise.all([
    prisma.route.findMany({ 
      select: { 
        id: true, 
        NAME: true,
        stops: { select: { id: true, NAME: true, AMOUNT: true } }
      }, 
      orderBy: { NAME: "asc" } 
    }),
    prisma.vehicle.findMany({ 
      select: { id: true, BUS_NUMBER: true, CAPACITY: true }, 
      orderBy: { BUS_NUMBER: "asc" } 
    }),
  ]);
  return <StudentForm routes={routes as any} vehicles={vehicles} />;
}
