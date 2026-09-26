import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RouteEditForm } from "@/modules/routes";

export const dynamic = "force-dynamic";

export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      assignedBuses: { select: { id: true, BUS_NUMBER: true } },
      stops: { orderBy: { ORDER: "asc" } },
      _count: { select: { students: true, stops: true, assignedBuses: true } },
    },
  });

  if (!route) notFound();

  return <RouteEditForm route={route} />;
}
