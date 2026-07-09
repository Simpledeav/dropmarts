"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    qty: number;
    priceAtPurchase: number;
    product: {
      id: string;
      name: string;
      images: Array<{ url: string }>;
    };
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
        My Orders
      </h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No orders yet</h2>
          <p className="text-text-secondary mb-6">
            When you place an order, it will appear here.
          </p>
          <Link href="/market">
            <Button variant="primary" size="lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl border border-border-light p-4 md:p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs text-text-muted font-mono">
                      #{order.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-text-muted">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-green">
                    {formatPrice(order.total)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-brand-green transition-colors" />
                </div>
              </div>

              {/* Order items preview */}
              <div className="flex items-center gap-3">
                {order.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 relative shrink-0"
                  >
                    {item.product.images[0] ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.product.images[0].url})` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-yellow-light to-brand-green-light">
                        <span className="text-sm font-bold text-white/60">
                          {item.product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <span className="text-xs text-text-muted font-medium">
                    +{order.items.length - 4} more
                  </span>
                )}
                <div className="ml-auto text-xs text-text-muted">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
