import prisma from "@/lib/prisma";
import { FuelForm } from "@/modules/fuel";
export const dynamic = "force-dynamic";

export default async function NewFuelPage() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, BUS_NUMBER: true, FUEL_TYPE: true, REGISTER_NUMBER: true },
    orderBy: { BUS_NUMBER: "asc" },
  });
  return <FuelForm vehicles={vehicles} />;
}
