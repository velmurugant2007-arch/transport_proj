import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const routes = await prisma.route.findMany({
    where: { deletedAt: null },
    orderBy: { NAME: "asc" },
    include: {
      stops: {
        orderBy: { ORDER: "asc" },
        include: { _count: { select: { students: true } } },
      },
      assignedBuses: {
        where: { deletedAt: null },
        select: {
          id: true,
          BUS_NUMBER: true,
          DRIVER_NAME: true,
          DRIVER_PHONE: true,
          FUEL_TYPE: true,
          STATUS: true,
          CAPACITY: true,
          MAKE: true,
          MODEL: true,
          REGISTER_NUMBER: true,
          _count: { select: { students: true } },
        },
      },
      _count: { select: { students: true, stops: true } },
    },
  });

  return NextResponse.json({ routes });
}
