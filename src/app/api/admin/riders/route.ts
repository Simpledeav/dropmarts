import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.roles.some((r) => r.role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const riders = await prisma.rider.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { dispatch: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ riders });
  } catch (error) {
    console.error("Admin riders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch riders" }, { status: 500 });
  }
}
