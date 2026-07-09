"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  total: number;
  deliveryMethod: string;
  paymentStatus: string;
  createdAt: string;
  buyer: { name: string; email: string };
  items: Array<{ product: { name: string } }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRefund = async (orderId: string) => {
    if (!confirm("Process refund for this order?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, { method: "POST" });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "cancelled", paymentStatus: "refunded" } : o));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to process refund");
      }
    } catch (err) {
      console.error("Refund error:", err);
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.buyer.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-gray-500">{orders.length} orders</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input type="text" placeholder="Search by order ID or buyer..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-800" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
          {filtered.map((order) => (
            <div key={order.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">#{order.id.slice(0, 8)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-500">{order.buyer.name} &middot; {formatDate(order.createdAt)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {order.items.slice(0, 2).map((item, i) => (
                    <span key={i} className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{item.product.name}</span>
                  ))}
                  {order.items.length > 2 && <span className="text-xs text-gray-600">+{order.items.length - 2}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{formatPrice(order.total)}</p>
                <p className="text-xs text-gray-500">{order.deliveryMethod === "openbox_pickup" ? "OpenBox" : "Delivery"}</p>
              </div>
              {(order.paymentStatus === "paid") && (
                <button onClick={() => handleRefund(order.id)} className="text-xs text-red-400 hover:text-red-300 underline">Refund</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-dashed border-gray-800">
          <ShoppingCart className="h-10 w-10 mx-auto text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No orders found.</p>
        </div>
      )}
    </div>
  );
}
