"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  vendorName: string;
  vendorId: string;
  qty: number;
  stockQty: number;
  subtotal: number;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data.cart || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (itemId: string, newQty: number) => {
    setUpdating(itemId);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, qty: newQty }),
      });

      if (res.ok) {
        if (newQty < 1) {
          setItems(items.filter((i) => i.id !== itemId));
        } else {
          setItems(
            items.map((i) =>
              i.id === itemId
                ? { ...i, qty: newQty, subtotal: i.price * newQty }
                : i
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to update cart:", err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      setItems(items.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setUpdating(null);
    }
  };

  // Recalculate total when items change
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(newTotal);
  }, [items]);

  // Group items by vendor
  const vendorGroups = items.reduce<Record<string, { name: string; items: CartItem[] }>>(
    (groups, item) => {
      if (!groups[item.vendorId]) {
        groups[item.vendorId] = { name: item.vendorName, items: [] };
      }
      groups[item.vendorId].items.push(item);
      return groups;
    },
    {}
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full mb-4 rounded-xl" />
        ))}
      </div>
    );
  }

  const deliveryFee = total >= 50000 ? 0 : Math.max(1500, total * 0.05);
  const grandTotal = total + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Your cart is empty</h2>
          <p className="text-text-secondary mb-6">
            Browse our marketplace and add items you love.
          </p>
          <Link href="/market">
            <Button variant="primary" size="lg">
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(vendorGroups).map(([vendorId, group]) => (
              <div key={vendorId} className="bg-white rounded-xl border border-border-light overflow-hidden">
                {/* Vendor header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-border-light">
                  <Store className="h-4 w-4 text-brand-purple" />
                  <span className="font-medium text-sm text-text-primary">
                    {group.name}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-border-light">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                      {/* Product image */}
                      <Link href={`/product/${item.productId}`} className="shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 relative">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-yellow-light to-brand-green-light">
                              <span className="text-xl font-bold text-white/60">{item.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.productId}`}
                          className="text-sm font-medium text-text-primary hover:text-brand-green truncate block"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm font-bold text-brand-green mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center border border-border-light rounded-lg">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          disabled={updating === item.id}
                          className="p-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium min-w-[30px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          disabled={updating === item.id || item.qty >= item.stockQty}
                          className="p-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-bold text-text-primary">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border-light p-6 sticky top-24">
              <h2 className="font-bold text-lg text-text-primary mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery Fee</span>
                  <span className={cn("font-medium", deliveryFee === 0 && "text-brand-green")}>
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-text-muted">
                    Free delivery on orders above {formatPrice(50000)}
                  </p>
                )}
                <hr className="border-border-light" />
                <div className="flex justify-between text-base">
                  <span className="font-bold text-text-primary">Total</span>
                  <span className="font-bold text-brand-green">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="xl"
                className="w-full mt-6"
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Link
                href="/market"
                className="block text-center text-sm text-text-muted hover:text-brand-green mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
