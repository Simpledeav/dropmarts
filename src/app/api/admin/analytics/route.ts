import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.roles.some((r: { role: string }) => r.role === "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalVendors,
      totalRiders,
      totalOrders,
      totalProducts,
      revenueResult,
      pendingVendors,
      pendingRiders,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.rider.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
      prisma.vendor.count({ where: { status: "pending" } }),
      prisma.rider.count({ where: { status: "pending" } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { buyer: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      summary: {
        totalUsers,
        totalVendors,
        totalRiders,
        totalOrders,
        totalProducts,
        totalRevenue: revenueResult._sum.total || 0,
        pendingVendors,
        pendingRiders,
      },

      recentOrders: recentOrders.map((o: { 
        id: string; 
        status: string; 
        total: number; 
        buyer: { name: string }; 
        createdAt: Date 
      }) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        buyerName: o.buyer.name,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
