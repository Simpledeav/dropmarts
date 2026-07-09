import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.rider) {
      return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });
    }

    const pendingRequests = await prisma.dispatchRequest.findMany({
      where: {
        status: "requested",
        riderId: null,
      },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, phone: true } },
            address: true,
            items: {
              take: 3,
              include: {
                product: { select: { name: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also get the rider's active/assigned requests
    const myRequests = await prisma.dispatchRequest.findMany({
      where: { riderId: user.rider.id },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, phone: true } },
            address: true,
            items: {
              take: 3,
              include: {
                product: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pendingRequests, myRequests });
  } catch (error) {
    console.error("Requests fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
