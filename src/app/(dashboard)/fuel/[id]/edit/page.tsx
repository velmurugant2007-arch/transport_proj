import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FuelEditForm } from "@/modules/fuel";

export default async function EditFuelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [log, vehicles] = await Promise.all([
    prisma.fuelLog.findUnique({ where: { id } }),
    prisma.vehicle.findMany({ select: { id: true, BUS_NUMBER: true, FUEL_TYPE: true, REGISTER_NUMBER: true }, orderBy: { BUS_NUMBER: "asc" } }),
  ]);
  if (!log) notFound();
  return <FuelEditForm log={log} vehicles={vehicles} />;
}
