import prisma from "@/lib/prisma";
import { ExpenseList } from "@/modules/expenses";
export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    where: { deletedAt: null },
    orderBy: { DATE: "desc" },
    include: { vehicles: true },
  });
  return <ExpenseList expenses={expenses} />;
}
