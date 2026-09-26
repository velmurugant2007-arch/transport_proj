import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MaintenanceEditForm } from "@/modules/maintenance";

export default async function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [log, vehicles] = await Promise.all([
    prisma.maintenanceLog.findUnique({ where: { id } }),
    prisma.vehicle.findMany({ select: { id: true, BUS_NUMBER: true }, orderBy: { BUS_NUMBER: "asc" } }),
  ]);
  if (!log) notFound();
  return <MaintenanceEditForm log={log} vehicles={vehicles} />;
}
