import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/cart - Get current user's cart
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ cart: [], total: 0 }, { status: 200 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
            vendor: { select: { businessName: true, id: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const items = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.images[0]?.url || null,
      vendorName: item.product.vendor.businessName,
      vendorId: item.product.vendor.id,
      qty: item.qty,
      stockQty: item.product.stockQty,
      subtotal: item.product.price * item.qty,
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return NextResponse.json({ cart: items, total });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to add items to cart" }, { status: 401 });
    }

    const { productId, qty = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stockQty < qty) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          qty,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

// PATCH /api/cart - Update cart item quantity
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, qty } = await request.json();

    if (qty < 1) {
      // Remove item if qty < 1
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, removed: true });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: user.id },
      include: { product: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    if (qty > item.product.stockQty) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { qty },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await request.json();

    await prisma.cartItem.delete({
      where: { id: itemId, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart delete error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
