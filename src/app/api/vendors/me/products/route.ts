import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/vendors/me/products - Get vendor's products
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { vendorId: user.vendor.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { name: true } },
          _count: { select: { orderItems: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stockQty: p.stockQty,
        status: p.status,
        sku: p.sku,
        imageUrl: p.images[0]?.url || null,
        categoryName: p.category?.name || null,
        orderCount: p._count.orderItems,
        reviewCount: p._count.reviews,
        createdAt: p.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Vendor products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/vendors/me/products - Create a product
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.vendor.status !== "approved") {
      return NextResponse.json({ error: "Your vendor account must be approved first" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, categoryId, price, stockQty, sku, imageUrl } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        vendorId: user.vendor.id,
        name,
        description: description || null,
        categoryId: categoryId || null,
        price: parseFloat(price),
        stockQty: parseInt(stockQty || "0"),
        sku: sku || null,
        status: parseInt(stockQty || "0") > 0 ? "active" : "inactive",
        images: imageUrl
          ? { create: [{ url: imageUrl, sortOrder: 0 }] }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
