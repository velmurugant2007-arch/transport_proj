import prisma from "@/lib/prisma";
import { MaintenanceForm } from "@/modules/maintenance";
export const dynamic = "force-dynamic";

export default async function NewMaintenancePage() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, BUS_NUMBER: true },
    orderBy: { BUS_NUMBER: "asc" },
  });
  return <MaintenanceForm vehicles={vehicles} />;
}
