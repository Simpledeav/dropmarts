import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/orders - Get current user's orders
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Create order from cart
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
    }

    const body = await request.json();
    const { deliveryMethod, deliveryAddress, lockerId } = body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create delivery address if home delivery
    let deliveryAddressId: string | null = null;
    if (deliveryMethod === "home_delivery" && deliveryAddress) {
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: user.id,
          line1: deliveryAddress.line1,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
        },
      });

      if (existingAddress) {
        deliveryAddressId = existingAddress.id;
      } else {
        const newAddress = await prisma.address.create({
          data: {
            userId: user.id,
            label: "Delivery",
            line1: deliveryAddress.line1,
            line2: deliveryAddress.line2 || null,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            phone: deliveryAddress.phone || null,
          },
        });
        deliveryAddressId = newAddress.id;
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const deliveryFee = subtotal >= 50000 ? 0 : Math.max(1500, subtotal * 0.05);
    const total = subtotal + deliveryFee;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        status: "placed",
        deliveryMethod: deliveryMethod || "home_delivery",
        deliveryAddressId: deliveryAddressId,
        lockerId: deliveryMethod === "openbox_pickup" ? (lockerId || null) : null,
        subtotal,
        deliveryFee,
        total,
        paymentStatus: "pending",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            vendorId: item.product.vendorId,
            qty: item.qty,
            priceAtPurchase: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
            },
          },
        },
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });

    // Update stock levels
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQty: { decrement: item.qty },
          ...(item.product.stockQty - item.qty <= 0 ? { status: "out_of_stock" } : {}),
        },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
