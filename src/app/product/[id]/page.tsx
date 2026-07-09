"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQty: number;
  status: string;
  sku: string | null;
  images: Array<{ id: string; url: string; sortOrder: number }>;
  category: { id: string; name: string; slug: string } | null;
  vendor: { id: string; businessName: string; logoUrl: string | null; description: string | null };
  rating: number | null;
  reviewCount: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    buyerName: string;
    createdAt: string;
  }>;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  vendorName: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, qty }),
      });

      if (res.ok) {
        router.push("/cart");
      } else {
        const data = await res.json();
        if (res.status === 401) {
          router.push(`/login?redirect=/product/${id}`);
        } else {
          alert(data.error || "Failed to add to cart");
        }
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Product Not Found</h1>
        <p className="text-text-secondary mb-6">This product may have been removed or doesn't exist.</p>
        <Link href="/market">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.status === "out_of_stock" || product.stockQty <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-brand-green">Home</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/market?category=${product.category.id}`} className="hover:text-brand-green">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text-primary truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left - Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-border-light">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-yellow-light to-brand-green-light">
                <span className="text-6xl font-bold text-white/60">{product.name.charAt(0)}</span>
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="error" size="md" className="text-base px-4 py-2">
                  Currently Out of Stock
                </Badge>
              </div>
            )}

            {/* Image navigation */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                  disabled={selectedImage === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                  disabled={selectedImage === product.images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
                    selectedImage === idx
                      ? "border-brand-green ring-1 ring-brand-green"
                      : "border-border-light hover:border-gray-300"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right - Product Info */}
        <div className="space-y-6">
          {/* Vendor */}
          <Link
            href={`/shop/${product.vendor.id}`}
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-purple to-brand-green flex items-center justify-center text-white text-xs font-bold">
              {product.vendor.businessName.charAt(0)}
            </div>
            {product.vendor.businessName}
          </Link>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.floor(product.rating || 0)
                      ? "fill-brand-yellow text-brand-yellow"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-text-primary">
              {product.rating?.toFixed(1) || "N/A"}
            </span>
            <span className="text-sm text-text-muted">
              ({product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-green">
              {formatPrice(product.price)}
            </span>
            <StatusBadge status={isOutOfStock ? "inactive" : product.status} />
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Description</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Truck className="h-4 w-4 text-brand-green" />
              <div>
                <p className="text-xs font-medium text-text-primary">Delivery</p>
                <p className="text-xs text-text-muted">
                  {product.price >= 50000 ? "Free" : "From ₦1,500"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-4 w-4 text-brand-green" />
              <div>
                <p className="text-xs font-medium text-text-primary">Warranty</p>
                <p className="text-xs text-text-muted">7-day return</p>
              </div>
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text-primary">Quantity:</span>
                <div className="flex items-center border border-border-light rounded-lg">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stockQty, qty + 1))}
                    disabled={qty >= product.stockQty}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-text-muted">
                  {product.stockQty} available
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="xl"
                  className="flex-1"
                  loading={addingToCart}
                  onClick={handleAddToCart}
                  icon={<ShoppingCart className="h-5 w-5" />}
                >
                  Add to Cart — {formatPrice(product.price * qty)}
                </Button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-border-light hover:border-gray-300 text-text-muted"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500")} />
                </button>
                <button className="p-4 rounded-xl border border-border-light text-text-muted hover:border-gray-300 transition-all">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Product SKU */}
          {product.sku && (
            <p className="text-xs text-text-muted">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-12 md:mt-16">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          Customer Reviews ({product.reviewCount})
        </h2>

        {product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-5 border border-border-light"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center">
                      {review.buyerName.charAt(0)}
                    </div>
                    <span className="font-medium text-sm text-text-primary">
                      {review.buyerName}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating
                          ? "fill-brand-yellow text-brand-yellow"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-sm text-text-secondary">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-border-default">
            <Star className="h-10 w-10 mx-auto text-text-muted mb-2" />
            <p className="text-text-muted">No reviews yet. Be the first to review this product.</p>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 md:mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Related Products</h2>
            {product.category && (
              <Link
                href={`/market?category=${product.category.id}`}
                className="text-sm text-brand-green hover:text-brand-green-dark font-medium"
              >
                View All
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map((rp) => (
              <ProductCard
                key={rp.id}
                id={rp.id}
                name={rp.name}
                price={rp.price}
                imageUrl={rp.imageUrl || undefined}
                vendorName={rp.vendorName}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
