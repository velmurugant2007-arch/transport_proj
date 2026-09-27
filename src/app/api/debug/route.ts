import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Check if DATABASE_URL is set
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 500 });
    }

    // 2. Try to query the Admin table
    const admins = await prisma.admin.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json({
      status: "connected",
      dbUrlPrefix: dbUrl.substring(0, 30) + "...",
      adminCount: admins.length,
      admins: admins,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
