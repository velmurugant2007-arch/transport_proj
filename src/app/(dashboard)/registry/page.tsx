import prisma from "@/lib/prisma";
import { TransportLedger } from "@/modules/registry";

export default async function RegistryPage() {
  const records = await prisma.transportRecord.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <TransportLedger records={records} />;
}
