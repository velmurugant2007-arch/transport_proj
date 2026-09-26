import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DocumentEditForm } from "@/modules/documents";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: {
      id: true, 
      BUS_NUMBER: true, 
      MAKE: true, 
      MODEL: true, 
      FUEL_TYPE: true,
      INSURANCE_NUMBER: true, 
      INSURANCE_DUE_DATE: true, 
      INSURANCE_EXPIRY: true,
      TAX_NUMBER: true, 
      TAX_DUE_DATE: true, 
      TAX_EXPIRY: true,
      ROAD_PERMIT_NUMBER: true, 
      ROAD_PERMIT_EXPIRY: true,
      POLLUTION_NUMBER: true, 
      POLLUTION_EXPIRY: true,
      FC_NUMBER: true, 
      FC_EXPIRY: true,
      createdBy: true,
      updatedBy: true,
    },
  });

  if (!vehicle) notFound();

  return <DocumentEditForm vehicle={vehicle} />;
}
