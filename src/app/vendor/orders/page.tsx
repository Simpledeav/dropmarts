"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Eye, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  buyerName: string;
  createdAt: string;
  total: number;
  items: Array<{
    productName: string;
    productImage: string | null;
    qty: number;
    price: number;
  }>;
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/vendors/me/orders");
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

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-900">Orders</h1>
        <p className="text-sm text-gray-500">{orders.length} total orders</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "", label: "All", count: orders.length },
          { key: "placed", label: "Placed", count: statusCounts["placed"] || 0 },
          { key: "confirmed", label: "Confirmed", count: statusCounts["confirmed"] || 0 },
          { key: "processing", label: "Processing", count: statusCounts["processing"] || 0 },
          { key: "in_transit", label: "In Transit", count: statusCounts["in_transit"] || 0 },
          { key: "delivered", label: "Delivered", count: statusCounts["delivered"] || 0 },
          { key: "cancelled", label: "Cancelled", count: statusCounts["cancelled"] || 0 },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              statusFilter === tab.key
                ? "bg-brand-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {tab.label}
            <span className={cn("text-xs", statusFilter === tab.key ? "text-white/70" : "text-gray-400")}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Link key={order.id} href={`/vendor/orders/${order.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-500">{order.buyerName} &middot; {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-900">{formatPrice(order.total)}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-purple transition-colors" />
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1">
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{item.productName}</span>
                    <span className="text-xs text-gray-400">x{item.qty}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-purple-900 mb-1">No orders yet</h3>
          <p className="text-sm text-gray-500">Orders from customers will appear here.</p>
        </div>
      )}
    </div>
  );
}
