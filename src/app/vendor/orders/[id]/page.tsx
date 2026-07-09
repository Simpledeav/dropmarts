"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, ShoppingCart, CheckCircle, XCircle, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface OrderDetail {
  id: string;
  status: string;
  buyerName: string;
  buyerPhone: string | null;
  deliveryMethod: string;
  deliveryAddress: { line1: string; city: string; state: string } | null;
  createdAt: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentStatus: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string | null;
    qty: number;
    price: number;
  }>;
}

const STATUS_ACTIONS: Record<string, { next: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  placed: [
    { next: "confirmed", label: "Confirm Order", icon: CheckCircle },
    { next: "cancelled", label: "Cancel Order", icon: XCircle },
  ],
  confirmed: [
    { next: "processing", label: "Start Processing", icon: RefreshCw },
    { next: "cancelled", label: "Cancel Order", icon: XCircle },
  ],
  processing: [
    { next: "in_transit", label: "Mark In Transit", icon: Truck },
    { next: "cancelled", label: "Cancel Order", icon: XCircle },
  ],
};

export default function VendorOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        const o = data.order;
        setOrder({
          id: o.id,
          status: o.status,
          buyerName: o.buyer?.name || "Unknown",
          buyerPhone: o.buyer?.phone || null,
          deliveryMethod: o.deliveryMethod,
          deliveryAddress: o.address ? { line1: o.address.line1, city: o.address.city, state: o.address.state } : null,
          createdAt: o.createdAt,
          total: o.total,
          subtotal: o.subtotal,
          deliveryFee: o.deliveryFee,
          paymentStatus: o.paymentStatus,
          items: o.items.map((item: any) => ({
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.images?.[0]?.url || null,
            qty: item.qty,
            price: item.priceAtPurchase,
          })),
        });
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(newStatus);
    try {
      const res = await fetch(`/api/vendors/me/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Order not found</p>
        <Link href="/vendor/orders"><Button variant="purple" className="mt-4">Back to Orders</Button></Link>
      </div>
    );
  }

  const actions = STATUS_ACTIONS[order.status] || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/vendor/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-purple">
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-purple-900">Order #{order.id.slice(0, 8)}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-900">{formatPrice(order.total)}</p>
            <p className="text-xs text-gray-500">Payment: <StatusBadge status={order.paymentStatus} /></p>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-sm text-purple-900 mb-2">Customer</h3>
          <p className="text-sm text-purple-700">{order.buyerName}</p>
          {order.buyerPhone && <p className="text-sm text-purple-500">{order.buyerPhone}</p>}
        </div>

        {/* Delivery */}
        {order.deliveryAddress && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-sm text-gray-900 mb-1">Delivery Address</h3>
            <p className="text-sm text-gray-600">{order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
          </div>
        )}

        {/* Status actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-xl">
            {actions.map((action) => {
              const Icon = action.icon;
              const variant = action.next === "cancelled" ? "danger" : "purple" as const;
              return (
                <Button key={action.next} variant={variant} size="sm" loading={updating === action.next}
                  onClick={() => updateStatus(action.next)} icon={<Icon className="h-4 w-4" />}>
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Items */}
        <h3 className="font-bold text-purple-900 mb-4">Items</h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {item.productImage ? (
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.productImage})` }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                    <Package className="h-5 w-5 text-brand-purple" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-900">{item.productName}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">x{item.qty}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.price * item.qty)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span className="font-medium">{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</span></div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-100"><span className="font-bold text-purple-900">Total</span><span className="font-bold text-brand-purple">{formatPrice(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}
