import prisma from "@/lib/prisma";
import { ExpenseForm } from "@/modules/expenses";
export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, BUS_NUMBER: true },
    orderBy: { BUS_NUMBER: "asc" },
  });
  return <ExpenseForm vehicles={vehicles} />;
}
