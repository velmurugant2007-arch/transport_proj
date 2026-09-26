import prisma from "@/lib/prisma";
import { VehicleList } from "@/modules/vehicles";
export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({ 
    where: { deletedAt: null },
    include: { 
      _count: { 
        select: { 
          students: true 
        } 
      },
      routes: {
        where: { deletedAt: null },
        include: { 
          stops: { 
            orderBy: { ORDER: "asc" } 
          } 
        }
      }
    },
    orderBy: { createdAt: "desc" } 
  });
  
  return <VehicleList vehicles={vehicles} />;
}
