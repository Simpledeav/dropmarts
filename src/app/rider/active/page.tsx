"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bike,
  Package,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  ChevronRight,
  ClipboardCheck,
  Truck,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";

interface ActiveDelivery {
  id: string;
  status: string;
  estimatedPayout: number | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  createdAt: string;
  order: {
    id: string;
    buyer: { name: string; phone: string | null };
    address: { line1: string; city: string; state: string } | null;
    items: Array<{ product: { name: string }; qty: number }>;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
}

const DELIVERY_STEPS = [
  { key: "accepted", label: "Accepted", icon: ClipboardCheck, desc: "You accepted the request" },
  { key: "picked_up", label: "Picked Up", icon: Package, desc: "Items collected from vendor" },
  { key: "in_transit", label: "In Transit", icon: Truck, desc: "Heading to delivery address" },
  { key: "delivered", label: "Delivered", icon: Home, desc: "Delivered to customer" },
];

export default function ActiveDeliveryPage() {
  const router = useRouter();
  const [delivery, setDelivery] = useState<ActiveDelivery | null>(null);
  const [allRequests, setAllRequests] = useState<Array<{ id: string; status: string; order: { id: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchActive = async () => {
    try {
      const res = await fetch("/api/riders/me/requests");
      const data = await res.json();
      const all = data.myRequests || [];
      setAllRequests(all);
      const active = all.find((r: any) => ["accepted", "picked_up", "in_transit"].includes(r.status));
      setDelivery(active || null);
    } catch (err) {
      console.error("Failed to fetch active delivery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActive(); }, []);

  const advanceStatus = async () => {
    if (!delivery) return;
    setUpdating(true);
    try {
      const transitions: Record<string, string> = {
        accepted: "picked_up",
        picked_up: "in_transit",
        in_transit: "delivered",
      };
      const nextStatus = transitions[delivery.status];
      if (!nextStatus) return;

      const res = await fetch(`/api/riders/me/active/${delivery.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        if (nextStatus === "delivered") {
          router.push("/rider/history?completed=true");
        } else {
          await fetchActive();
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to advance status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!delivery) {
    return (
      <div className="text-center py-16">
        <Bike className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-purple-900 mb-2">No Active Delivery</h2>
        <p className="text-gray-500 mb-6">You don&apos;t have any active deliveries. Check available requests.</p>
        <Link href="/rider/requests"><Button variant="purple">View Requests</Button></Link>
      </div>
    );
  }

  const currentStepIndex = DELIVERY_STEPS.findIndex((s) => s.key === delivery.status);
  const isDelivered = delivery.status === "delivered";
  const nextAction = isDelivered ? null : DELIVERY_STEPS[currentStepIndex + 1];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-900">Active Delivery</h1>
        <p className="text-sm text-gray-500">Order #{delivery.order.id.slice(0, 8)}</p>
      </div>

      {/* Status stepper */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          {DELIVERY_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                {idx < DELIVERY_STEPS.length - 1 && (
                  <div className={cn("absolute top-5 left-[60%] w-[80%] h-0.5", isCompleted && currentStepIndex > idx ? "bg-brand-purple" : "bg-gray-200")} />
                )}
                <div className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted ? "bg-brand-purple text-white" : isCurrent ? "bg-brand-purple/20 text-brand-purple border-2 border-brand-purple" : "bg-gray-100 text-gray-400"
                )}>
                  {isCompleted && currentStepIndex > idx ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={cn("text-xs mt-2 text-center font-medium", isCompleted ? "text-purple-900" : "text-gray-400")}>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Current status info */}
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-purple-900">
            {DELIVERY_STEPS[currentStepIndex]?.desc || "Delivery completed"}
          </p>
        </div>

        {/* Action button */}
        {nextAction && (
          <Button variant="purple" size="xl" className="w-full mt-4" loading={updating} onClick={advanceStatus}
            icon={<ChevronRight className="h-5 w-5" />}>
            Mark as {nextAction.label}
          </Button>
        )}
      </div>

      {/* Delivery details */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        {/* Customer info */}
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-2">Customer</h3>
          <div className="flex items-center justify-between">
            <p className="font-medium text-purple-900">{delivery.order.buyer.name}</p>
            {delivery.order.buyer.phone && (
              <a href={`tel:${delivery.order.buyer.phone}`} className="flex items-center gap-1 text-sm text-brand-purple hover:text-purple-700">
                <Phone className="h-4 w-4" /> {delivery.order.buyer.phone}
              </a>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Pickup / Drop-off */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">PICKUP</p>
              <p className="text-sm text-purple-900">{delivery.pickupAddress || "Vendor location"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Navigation className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">DROP-OFF</p>
              <p className="text-sm text-purple-900">
                {delivery.dropoffAddress || 
                  (delivery.order.address 
                    ? `${delivery.order.address.line1}, ${delivery.order.address.city}`
                    : "Customer address")}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Items */}
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-2">Items</h3>
          <div className="space-y-2">
            {delivery.order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-purple-900">{item.product.name}</span>
                <span className="text-xs text-gray-500">x{item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Payout */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Estimated Payout</span>
          <span className="font-bold text-brand-purple">{formatPrice(delivery.estimatedPayout || 0)}</span>
        </div>
      </div>
    </div>
  );
}
