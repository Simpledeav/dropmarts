"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation, MapPin, Package, DollarSign, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateRelative, cn } from "@/lib/utils";

interface DispatchRequest {
  id: string;
  status: string;
  estimatedPayout: number | null;
  createdAt: string;
  order: {
    id: string;
    buyer: { name: string; phone: string | null };
    address: { line1: string; city: string; state: string } | null;
    items: Array<{ product: { name: string } }>;
  };
}

export default function RiderRequestsPage() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<DispatchRequest[]>([]);
  const [myRequests, setMyRequests] = useState<DispatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/riders/me/requests");
        const data = await res.json();
        setPendingRequests(data.pendingRequests || []);
        setMyRequests(data.myRequests || []);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/riders/me/requests/${id}/accept`, { method: "POST" });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== id));
        router.push("/rider/active");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to accept request");
      }
    } catch (err) {
      console.error("Failed to accept:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/riders/me/requests/${id}/decline`, { method: "POST" });
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to decline:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>;
  }

  const activeRequest = myRequests.find((r) => ["accepted", "picked_up", "in_transit"].includes(r.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-900">Dispatch Requests</h1>
        <p className="text-sm text-gray-500">{pendingRequests.length} available jobs</p>
      </div>

      {/* Active request banner */}
      {activeRequest && (
        <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-purple-900 text-sm">You have an active delivery</p>
              <p className="text-xs text-purple-500">Status: {activeRequest.status}</p>
            </div>
          </div>
          <a href="/rider/active"><Button variant="purple" size="sm">View</Button></a>
        </div>
      )}

      {/* Pending requests */}
      {pendingRequests.length > 0 ? (
        <div className="space-y-3">
          {pendingRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-mono">#{req.order.id.slice(0, 8)}</span>
                    {req.estimatedPayout && (
                      <Badge variant="success" size="sm">{formatPrice(req.estimatedPayout)}</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-purple-900">{req.order.buyer.name}</p>
                  <p className="text-xs text-gray-500">
                    {req.order.items.length} item{req.order.items.length !== 1 ? "s" : ""} &middot; {formatDateRelative(req.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleAccept(req.id)} disabled={actionLoading === req.id}
                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50">
                    <Check className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDecline(req.id)} disabled={actionLoading === req.id}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {req.order.address ? `${req.order.address.city}, ${req.order.address.state}` : "Pickup"}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {req.order.items.map((item) => item.product.name).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Navigation className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-purple-900 mb-1">No requests available</h3>
          <p className="text-sm text-gray-500">Make sure you&apos;re online to receive dispatch requests.</p>
        </div>
      )}

      {/* My recent requests */}
      {myRequests.length > 0 && (
        <div>
          <h2 className="font-bold text-purple-900 mb-3">My Requests</h2>
          <div className="space-y-2">
            {myRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-3">
                <div>
                  <p className="text-sm font-medium text-purple-900">#{req.order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{req.order.buyer.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={req.status === "delivered" ? "success" : req.status === "cancelled" ? "error" : "warning"} size="sm">
                    {req.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
