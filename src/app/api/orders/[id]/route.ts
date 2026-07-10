import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            vendorId: true,
            qty: true,
            priceAtPurchase: true,
            product: {
              select: {
                id: true,
                name: true,
                images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
                vendor: { select: { businessName: true } },
              },
            },
          },
        },
        buyer: { select: { id: true, name: true, phone: true } },
        address: true,
        payments: true,
        dispatch: {
          include: {
            rider: {
              include: {
                user: { select: { name: true, phone: true } },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure user owns this order, is admin, or is a vendor with items in this order
    const isAdmin = user.roles.some((r: { role: string }) => r.role === "admin");
    const isVendorInOrder = user.vendor && order.items.some((i: { vendorId: string }) => i.vendorId === user.vendor!.id);
    if (order.buyerId !== user.id && !isAdmin && !isVendorInOrder) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
