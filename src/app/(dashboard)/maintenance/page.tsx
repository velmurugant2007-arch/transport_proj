import prisma from "@/lib/prisma";
import { MaintenanceList } from "@/modules/maintenance";
export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const logs = await prisma.maintenanceLog.findMany({
    where: { deletedAt: null },
    orderBy: { DATE: "desc" },
    include: { vehicle: true },
  });
  return <MaintenanceList logs={logs} />;
}
