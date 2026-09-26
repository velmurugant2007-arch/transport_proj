import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VehicleEditForm } from "@/modules/vehicles";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) notFound();
  return <VehicleEditForm vehicle={vehicle} />;
}
