import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const vendor = searchParams.get("vendor");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const inStock = searchParams.get("inStock") === "true";

    const where: Record<string, any> = {
      status: "active",
    };

    if (category) {
      where.categoryId = category;
    }

    if (q) {
      // SQLite's LIKE is case-insensitive for ASCII by default
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (vendor) {
      where.vendorId = vendor;
    }

    if (inStock) {
      where.stockQty = { gt: 0 };
    }

    // Determine sort order
    let orderBy: Record<string, string> = {};
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          vendor: { select: { businessName: true } },
          category: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((product: typeof products[number]) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
            product.reviews.length
          : null;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stockQty: product.stockQty,
        status: product.stockQty > 0 ? product.status : "out_of_stock",
        sku: product.sku,
        imageUrl: product.images[0]?.url || null,
        vendorName: product.vendor.businessName,
        categoryName: product.category?.name || null,
        categorySlug: product.category?.slug || null,
        rating: avgRating,
        reviewCount: product.reviews.length,
        createdAt: product.createdAt,
      };
    });

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
