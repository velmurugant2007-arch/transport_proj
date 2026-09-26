import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ExpenseEditForm } from "@/modules/expenses";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expense, vehicles] = await Promise.all([
    prisma.expense.findUnique({ where: { id }, include: { vehicles: true } }),
    prisma.vehicle.findMany({ select: { id: true, BUS_NUMBER: true }, orderBy: { BUS_NUMBER: "asc" } }),
  ]);
  if (!expense) notFound();
  return <ExpenseEditForm expense={expense} vehicles={vehicles} />;
}
