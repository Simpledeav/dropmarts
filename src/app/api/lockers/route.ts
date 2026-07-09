import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lockers = await prisma.locker.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ lockers });
  } catch (error) {
    console.error("Lockers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch lockers" }, { status: 500 });
  }
}
