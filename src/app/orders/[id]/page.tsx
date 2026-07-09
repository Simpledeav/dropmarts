"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  RefreshCw,
  Truck,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  deliveryMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: string;
  createdAt: string;
  address: { line1: string; line2?: string; city: string; state: string } | null;
  items: Array<{
    id: string;
    qty: number;
    priceAtPurchase: number;
    product: {
      id: string;
      name: string;
      images: Array<{ url: string }>;
      vendor: { businessName: string };
    };
  }>;
  dispatch: {
    id: string;
    status: string;
    rider: { user: { name: string; phone: string } } | null;
  } | null;
}

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: RefreshCw },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          if (res.status === 404) {
            setOrder(null);
            return;
          }
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-6 w-48 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Order Not Found</h1>
        <p className="text-text-secondary mb-6">This order doesn't exist or has been removed.</p>
        <Link href="/orders">
          <Button variant="primary">View My Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Back button */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-green mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="bg-white rounded-xl border border-border-light p-6 md:p-8">
        {/* Order header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-text-primary">Order #{order.id.slice(0, 8)}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-text-muted">
              Placed on {formatDate(order.createdAt)} &middot;{" "}
              {order.deliveryMethod === "home_delivery" ? "Home Delivery" : "OpenBox Pickup"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-green">{formatPrice(order.total)}</p>
            <p className="text-xs text-text-muted">
              Payment: <StatusBadge status={order.paymentStatus} />
            </p>
          </div>
        </div>

        {/* Status stepper */}
        {!isCancelled ? (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 relative">
                    {/* Connector line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "absolute top-4 left-[60%] w-[80%] h-0.5",
                          isCompleted && currentStepIndex > idx
                            ? "bg-brand-green"
                            : "bg-gray-200"
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        isCompleted
                          ? "bg-brand-green text-white"
                          : isCurrent
                          ? "bg-brand-green/20 text-brand-green border-2 border-brand-green"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-1.5 text-center font-medium",
                        isCompleted || isCurrent
                          ? "text-text-primary"
                          : "text-text-muted"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700 text-sm">Order Cancelled</p>
              <p className="text-xs text-red-500">This order has been cancelled.</p>
            </div>
          </div>
        )}

        {/* Delivery info */}
        {order.address && (
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-sm text-text-primary mb-2">Delivery Address</h3>
            <p className="text-sm text-text-secondary">
              {order.address.line1}
              {order.address.line2 && `, ${order.address.line2}`}
              <br />
              {order.address.city}, {order.address.state}
            </p>
          </div>
        )}

        {/* Dispatch info */}
        {order.dispatch?.rider && (
          <div className="mb-8 p-4 bg-brand-yellow/10 rounded-xl border border-brand-yellow/20">
            <h3 className="font-medium text-sm text-text-primary mb-2">Rider Assigned</h3>
            <p className="text-sm text-text-secondary">
              {order.dispatch.rider.user.name} &middot; {order.dispatch.rider.user.phone}
            </p>
          </div>
        )}

        {/* Order items */}
        <div>
          <h3 className="font-bold text-text-primary mb-4">Items</h3>
          <div className="divide-y divide-border-light">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  {item.product.images[0] ? (
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.product.images[0].url})` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-yellow-light to-brand-green-light">
                      <span className="text-lg font-bold text-white/60">
                        {item.product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.id}`} className="text-sm font-medium text-text-primary hover:text-brand-green">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-text-muted">{item.product.vendor.businessName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatPrice(item.priceAtPurchase)} x {item.qty}
                  </p>
                  <p className="text-sm font-bold text-brand-green">
                    {formatPrice(item.priceAtPurchase * item.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-6 pt-4 border-t border-border-light space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Delivery Fee</span>
            <span className="font-medium">
              {order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-border-light">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-bold text-brand-green">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
