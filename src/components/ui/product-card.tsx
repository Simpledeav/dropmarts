"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  vendorName?: string;
  rating?: number;
  reviewCount?: number;
  status?: string;
  className?: string;
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  imageUrl,
  vendorName,
  rating,
  reviewCount,
  status,
  className,
  onAddToCart,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = status === "out_of_stock" || status === "inactive";
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div
      className={cn(
        "group bg-white rounded-xl shadow-sm border border-border-light overflow-hidden",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isOutOfStock && "opacity-75",
        className
      )}
    >
      <Link href={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-yellow-light to-brand-green-light">
            <span className="text-4xl font-bold text-white/80">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm",
            "transition-all duration-200 hover:scale-110",
            "opacity-0 group-hover:opacity-100",
            isWishlisted && "opacity-100"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            )}
          />
        </button>

        {/* Discount badge */}
        {hasDiscount && (
          <Badge variant="warning" className="absolute top-2 left-2">
            -{Math.round(((originalPrice! - price) / originalPrice!) * 100)}%
          </Badge>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="error" size="md">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      <div className="p-3 md:p-4 space-y-1.5">
        {/* Vendor name */}
        {vendorName && (
          <p className="text-xs text-text-muted truncate">{vendorName}</p>
        )}

        {/* Product name */}
        <Link href={`/product/${id}`}>
          <h3 className="text-sm md:text-base font-semibold text-text-primary truncate hover:text-brand-green transition-colors">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base md:text-lg font-bold text-brand-green">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-text-muted line-through">
              {formatPrice(originalPrice!)}
            </span>
          )}
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(rating)
                      ? "fill-brand-yellow text-brand-yellow"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            {reviewCount !== undefined && (
              <span className="text-xs text-text-muted">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Add to cart button */}
        {!isOutOfStock && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onAddToCart}
            icon={<ShoppingCart className="h-3.5 w-3.5" />}
          >
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}
