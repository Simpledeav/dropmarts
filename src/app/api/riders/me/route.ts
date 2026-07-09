import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.rider) {
      return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });
    }

    const rider = await prisma.rider.findUnique({
      where: { id: user.rider.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { dispatch: true } },
      },
    });

    return NextResponse.json({ rider });
  } catch (error) {
    console.error("Rider fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch rider profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.rider) {
      return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { vehicleType, coverageArea, isOnline } = body;

    const rider = await prisma.rider.update({
      where: { id: user.rider.id },
      data: {
        ...(vehicleType !== undefined && { vehicleType }),
        ...(coverageArea !== undefined && { coverageArea }),
        ...(isOnline !== undefined && { isOnline }),
      },
    });

    return NextResponse.json({ rider });
  } catch (error) {
    console.error("Rider update error:", error);
    return NextResponse.json({ error: "Failed to update rider profile" }, { status: 500 });
  }
}
