import prisma from "@/lib/prisma";
import MapWrapper from "@/components/maps/MapWrapper";

export const dynamic = "force-dynamic";

export default async function RouteMapPage() {
  const routes = await prisma.route.findMany({
    where: { deletedAt: null },
    orderBy: { NAME: "asc" },
    include: {
      stops: {
        orderBy: { ORDER: "asc" },
        include: { _count: { select: { students: true } } },
      },
      assignedBuses: {
        where: { deletedAt: null },
        select: {
          id: true, BUS_NUMBER: true, DRIVER_NAME: true, DRIVER_PHONE: true,
          FUEL_TYPE: true, STATUS: true, CAPACITY: true,
          MAKE: true, MODEL: true, REGISTER_NUMBER: true,
          _count: { select: { students: true } },
        },
      },
      _count: { select: { students: true, stops: true } },
    },
  });

  return (
    <div
      className="page-enter"
      style={{ height: "calc(100vh - 80px)", margin: "-2rem", overflow: "hidden" }}
    >
      <MapWrapper routes={routes} />
    </div>
  );
}
