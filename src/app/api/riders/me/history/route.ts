import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.rider) {
      return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });
    }

    const completed = await prisma.dispatchRequest.findMany({
      where: {
        riderId: user.rider.id,
        status: { in: ["delivered", "cancelled"] },
      },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            total: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const totalEarnings = completed
      .filter((d: typeof completed[number]) => d.status === "delivered")
      .reduce((sum: number, d: typeof completed[number]) => sum + (d.estimatedPayout || 0), 0);

    const totalDeliveries = completed.filter((d: typeof completed[number]) => d.status === "delivered").length;
    const totalDistance = completed.length * 5; // Simulated: 5km per delivery

    return NextResponse.json({
      history: completed.map((d: typeof completed[number]) => ({
        id: d.id,
        orderId: d.orderId,
        status: d.status,
        payout: d.estimatedPayout,
        completedAt: d.updatedAt.toISOString(),
        createdAt: d.createdAt.toISOString(),
      })),
      earnings: {
        total: totalEarnings,
        thisWeek: totalEarnings * 0.3, // Rough estimate
        today: totalEarnings * 0.05,
      },
      stats: {
        totalDeliveries,
        totalDistance,
        avgRating: 4.8, // Simulated
      },
    });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
