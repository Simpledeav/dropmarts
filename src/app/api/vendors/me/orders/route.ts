import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { vendorId: user.vendor.id },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, phone: true } },
            address: true,
          },
        },
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
    });

    // Group by order
    const orderMap = new Map<string, {
      id: string;
      status: string;
      buyerName: string;
      buyerPhone: string | null;
      deliveryAddress: { line1: string; city: string; state: string } | null;
      createdAt: string;
      total: number;
      items: Array<{
        id: string;
        productId: string;
        productName: string;
        productImage: string | null;
        qty: number;
        price: number;
      }>;
    }>();

    for (const item of orderItems) {
      const orderId = item.orderId;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          status: item.order.status,
          buyerName: item.order.buyer.name,
          buyerPhone: item.order.buyer.phone,
          deliveryAddress: item.order.address
            ? { line1: item.order.address.line1, city: item.order.address.city, state: item.order.address.state }
            : null,
          createdAt: item.order.createdAt.toISOString(),
          total: item.order.total,
          items: [],
        });
      }

      orderMap.get(orderId)!.items.push({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || null,
        qty: item.qty,
        price: item.priceAtPurchase,
      });
    }

    const orders = Array.from(orderMap.values());

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Vendor orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
