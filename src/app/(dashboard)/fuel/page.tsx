import prisma from "@/lib/prisma";
import { FuelList } from "@/modules/fuel";
export const dynamic = "force-dynamic";

export default async function FuelPage() {
  const logs = await prisma.fuelLog.findMany({
    where: { deletedAt: null },
    orderBy: { DATE: "desc" },
    include: { vehicle: true },
  });
  return <FuelList logs={logs} />;
}
