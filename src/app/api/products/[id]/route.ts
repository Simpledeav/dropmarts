import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        vendor: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
            description: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: {
            buyer: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          product.reviews.length
        : null;

    // Get related products (same category)
    let relatedProducts: any[] = [];
    if (product.categoryId) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: "active",
        },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          vendor: { select: { businessName: true } },
        },
        take: 8,
      });
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stockQty: product.stockQty,
        status: product.stockQty > 0 ? product.status : "out_of_stock",
        sku: product.sku,
        images: product.images.map((img: typeof product.images[number]) => ({
          id: img.id,
          url: img.url,
          sortOrder: img.sortOrder,
        })),
        category: product.category,
        vendor: product.vendor,
        rating: avgRating,
        reviewCount: product.reviews.length,
        reviews: product.reviews.map((r: typeof product.reviews[number]) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          buyerName: r.buyer.name,
          createdAt: r.createdAt,
        })),
        createdAt: product.createdAt,
      },
      relatedProducts: relatedProducts.map((p: typeof relatedProducts[number]) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.images[0]?.url || null,
        vendorName: p.vendor.businessName,
      })),
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
