import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendorId = user.vendor.id;

    // Real data from database
    const [products, orderItems, recentOrders] = await Promise.all([
      prisma.product.findMany({
        where: { vendorId },
        select: { id: true, name: true, price: true, stockQty: true, status: true, createdAt: true },
      }),
      prisma.orderItem.findMany({
        where: { vendorId },
        include: {
          order: { select: { status: true, createdAt: true, total: true } },
        },
        orderBy: { order: { createdAt: "desc" } },
      }),
      prisma.orderItem.findMany({
        where: { vendorId },
        include: {
          order: {
            select: { id: true, status: true, createdAt: true, buyer: { select: { name: true } } },
          },
          product: { select: { name: true } },
        },
        orderBy: { order: { createdAt: "desc" } },
        take: 10,
      }),
    ]);

    // Compute metrics
    const totalProducts = products.length;
    const activeProducts = products.filter((p: typeof products[number]) => p.status === "active" || p.status === "in_stock").length;
    const lowStockProducts = products.filter((p: typeof products[number]) => p.stockQty > 0 && p.stockQty <= 5).length;
    const outOfStockProducts = products.filter((p: typeof products[number]) => p.stockQty <= 0).length;

    const totalOrders = orderItems.length;
    const completedOrders = orderItems.filter((oi: typeof orderItems[number]) => oi.order.status === "delivered").length;
    const pendingOrders = orderItems.filter((oi: typeof orderItems[number]) =>
      ["placed", "confirmed", "processing"].includes(oi.order.status)
    ).length;

    const totalRevenue = orderItems
      .filter((oi: typeof orderItems[number]) => oi.order.status === "delivered")
      .reduce((sum: number, oi: typeof orderItems[number]) => sum + oi.priceAtPurchase * oi.qty, 0);

    // Generate 30 days of sales data for chart
    const salesData: Array<{ date: string; sales: number; orders: number }> = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orderItems.filter((oi: typeof orderItems[number]) => {
        const oDate = oi.order.createdAt.toISOString().split("T")[0];
        return oDate === dateStr;
      });

      salesData.push({
        date: dateStr,
        sales: dayOrders.reduce((sum: number, oi: typeof orderItems[number]) => sum + oi.priceAtPurchase * oi.qty, 0),
        orders: new Set(dayOrders.map((oi: typeof orderItems[number]) => oi.orderId)).size,
      });
    }

    // Top selling products
    const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const oi of orderItems) {
      if (!productSales.has(oi.productId)) {
        const p = products.find((pr: typeof products[number]) => pr.id === oi.productId);
        productSales.set(oi.productId, { name: p?.name || "Unknown", qty: 0, revenue: 0 });
      }
      const ps = productSales.get(oi.productId)!;
      ps.qty += oi.qty;
      ps.revenue += oi.priceAtPurchase * oi.qty;
    }

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]: [string, { name: string; qty: number; revenue: number }]) => ({ id, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // Category breakdown
    const categorySales = new Map<string, number>();
    for (const oi of orderItems) {
      const p = products.find((pr: typeof products[number]) => pr.id === oi.productId);
      const cat = p?.name?.split(" ")[0] || "Other";
      categorySales.set(cat, (categorySales.get(cat) || 0) + oi.priceAtPurchase * oi.qty);
    }

    return NextResponse.json({
      summary: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
      },
      salesData,
      topProducts,
      categoryBreakdown: Array.from(categorySales.entries()).map(([name, value]: [string, number]) => ({ name, value })),
      recentOrders: recentOrders.map((oi: typeof recentOrders[number]) => ({
        id: oi.orderId,
        product: oi.product.name,
        buyerName: oi.order.buyer.name,
        status: oi.order.status,
        qty: oi.qty,
        total: oi.priceAtPurchase * oi.qty,
        date: oi.order.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
