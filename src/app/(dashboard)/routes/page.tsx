import prisma from "@/lib/prisma";
import { RouteList } from "@/modules/routes";
export const dynamic = "force-dynamic";

export default async function RoutesPage({ searchParams }: { searchParams: { id?: string } }) {
  const { id } = await searchParams;
  
  const routes = await prisma.route.findMany({
    where: { 
      deletedAt: null,
      ...(id ? { id } : {})
    },
    orderBy: { NAME: "asc" },
    include: { 
      _count: { select: { students: true, stops: true, assignedBuses: true } },
      assignedBuses: { 
        where: { deletedAt: null },
        select: { id: true, BUS_NUMBER: true, MAKE: true, MODEL: true, REGISTER_NUMBER: true } 
      },
      students: { 
        where: { deletedAt: null },
        select: { 
          id: true, 
          STUDENT_NAME: true, 
          REGISTER_NUMBER: true,
          boardingPointId: true,
          assignedBusId: true
        } 
      },
      stops: {
        include: { _count: { select: { students: true } } },
        orderBy: { ORDER: "asc" }
      }
    },
  });
  
  return <RouteList routes={routes} />;
}
