import prisma from "@/lib/prisma";
import { DocumentList } from "@/modules/documents";
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null },
    orderBy: { BUS_NUMBER: "asc" },
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

  return <DocumentList vehicles={vehicles} />;
}
