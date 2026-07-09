import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.vendorId !== user.vendor.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, categoryId, price, stockQty, status, sku, imageUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stockQty !== undefined) updateData.stockQty = parseInt(stockQty);
    if (status !== undefined) updateData.status = status;
    if (sku !== undefined) updateData.sku = sku;

    // Auto-update status based on stock
    if (stockQty !== undefined) {
      const newStockQty = parseInt(stockQty);
      updateData.status = newStockQty > 0 ? "active" : "inactive";
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { name: true } },
      },
    });

    // Handle image update if provided
    if (imageUrl) {
      const existingImages = await prisma.productImage.findMany({
        where: { productId: id },
      });

      if (existingImages.length > 0) {
        await prisma.productImage.update({
          where: { id: existingImages[0].id },
          data: { url: imageUrl },
        });
      } else {
        await prisma.productImage.create({
          data: { productId: id, url: imageUrl, sortOrder: 0 },
        });
      }
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !user.vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.vendorId !== user.vendor.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
