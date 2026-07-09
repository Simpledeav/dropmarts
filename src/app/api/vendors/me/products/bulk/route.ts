import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const bulkProductSchema = z.object({
  products: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stockQty: z.number().int().min(0).default(0),
    sku: z.string().optional(),
    categoryId: z.string().optional(),
    imageUrl: z.string().optional(),
  })).min(1).max(100),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = user.vendor;
    if (vendor.status !== "approved") {
      return NextResponse.json({ error: "Vendor account must be approved" }, { status: 403 });
    }

    const body = await request.json();
    const validation = bulkProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid product data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { products } = validation.data;

    const created = await prisma.product.createMany({
      data: products.map((p) => ({
        vendorId: vendor.id,
        name: p.name,
        description: p.description || null,
        price: p.price,
        stockQty: p.stockQty,
        sku: p.sku || null,
        categoryId: p.categoryId || null,
        status: p.stockQty > 0 ? "active" : "inactive",
      })),
    });

    return NextResponse.json({
      success: true,
      count: created.count,
      message: `Successfully imported ${created.count} products`,
    }, { status: 201 });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 });
  }
}
