import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { vendorId: user.vendor.id },
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { stockQty: "asc" },
    });

    const inventory = products.map((p: typeof products[number]) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      stockQty: p.stockQty,
      status: p.stockQty <= 0 ? "out_of_stock" : p.stockQty <= 5 ? "low_stock" : p.status,
      imageUrl: p.images[0]?.url || null,
      totalSold: p._count.orderItems,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, stockQty } = body;

    if (!productId || stockQty === undefined) {
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.vendorId !== user.vendor.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQty: parseInt(stockQty),
        status: parseInt(stockQty) > 0 ? "active" : "inactive",
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
