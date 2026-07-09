"use client";

import { useEffect, useState, useRef } from "react";
import { Map, Navigation, Bike, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ActiveDelivery {
  id: string;
  status: string;
  estimatedPayout: number | null;
  order: {
    id: string;
    buyer: { name: string };
    address: { line1: string; city: string; state: string } | null;
  };
}

// Simulated route points around Lagos
const SIMULATED_ROUTE = [
  { lat: 6.5244, lng: 3.3792, label: "Ikeja" },
  { lat: 6.5178, lng: 3.3875, label: "Opebi" },
  { lat: 6.5100, lng: 3.3950, label: "Allen Ave" },
  { lat: 6.5000, lng: 3.4050, label: "Oregun" },
  { lat: 6.4900, lng: 3.4150, label: "Alausa" },
  { lat: 6.4800, lng: 3.4250, label: "Maryland" },
  { lat: 6.4700, lng: 3.4350, label: "Mile 12" },
  { lat: 6.4600, lng: 3.4450, label: "Ketu" },
];

export default function RiderTrackingPage() {
  const [delivery, setDelivery] = useState<ActiveDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchActive() {
      try {
        const res = await fetch("/api/riders/me/requests");
        const data = await res.json();
        const all = data.myRequests || [];
        const active = all.find((r: any) => ["accepted", "picked_up", "in_transit"].includes(r.status));
        setDelivery(active || null);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActive();
  }, []);

  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentPoint(0);
    intervalRef.current = setInterval(() => {
      setCurrentPoint((prev) => {
        if (prev >= SIMULATED_ROUTE.length - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsSimulating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSimulating(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentCoord = SIMULATED_ROUTE[currentPoint];

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!delivery) {
    return (
      <div className="text-center py-16">
        <Map className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-purple-900 mb-2">No Active Delivery</h2>
        <p className="text-gray-500 mb-6">Start a delivery to see live tracking.</p>
        <a href="/rider/requests"><Button variant="purple">View Requests</Button></a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-900">Live Tracking</h1>
        <p className="text-sm text-gray-500">Order #{delivery.order.id.slice(0, 8)}</p>
      </div>

      {/* Map visualization */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 h-64 md:h-80 relative flex items-center justify-center">
          {/* Simulated map */}
          <div className="absolute inset-0 p-4">
            {/* Route line */}
            <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
              <polyline
                points={SIMULATED_ROUTE.map((p, i) => {
                  const x = 20 + (i * 260) / (SIMULATED_ROUTE.length - 1);
                  const y = 180 - (p.lat - 6.45) * 500;
                  return `${x},${y}`;
                }).join(" ")}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeDasharray="6,4"
                opacity="0.5"
              />
              {/* Completed route */}
              {currentPoint > 0 && (
                <polyline
                  points={SIMULATED_ROUTE.slice(0, currentPoint + 1).map((p, i) => {
                    const x = 20 + (i * 260) / (SIMULATED_ROUTE.length - 1);
                    const y = 180 - (p.lat - 6.45) * 500;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
              )}
              {/* Points */}
              {SIMULATED_ROUTE.map((p, i) => {
                const x = 20 + (i * 260) / (SIMULATED_ROUTE.length - 1);
                const y = 180 - (p.lat - 6.45) * 500;
                const isCurrent = i === currentPoint;
                const isPast = i < currentPoint;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={isCurrent ? 8 : 5}
                      fill={isPast ? "#8b5cf6" : isCurrent ? "#8b5cf6" : "#e5e7eb"}
                      stroke={isCurrent ? "#fff" : "none"}
                      strokeWidth={isCurrent ? 3 : 0} />
                    {isCurrent && (
                      <>
                        <circle cx={x} cy={y} r={14} fill="#8b5cf6" opacity="0.2" />
                        <text x={x} y={y - 14} textAnchor="middle" fontSize="8" fill="#6b7280">
                          {p.label}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Info overlay */}
          <div className="relative bg-white/90 rounded-xl shadow-sm px-4 py-2 text-center">
            <div className="flex items-center gap-2 text-brand-purple">
              <Bike className="h-5 w-5" />
              <span className="font-bold text-sm">Rider Position</span>
            </div>
            {currentCoord && (
              <p className="text-xs text-gray-500 mt-1">
                {currentCoord.label} &middot; {currentCoord.lat.toFixed(4)}, {currentCoord.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-purple-900 text-sm">Simulation Controls</h3>
            <p className="text-xs text-gray-500">Animate rider position along route</p>
          </div>
          <Badge variant={currentPoint >= SIMULATED_ROUTE.length - 1 ? "success" : "warning"} size="sm">
            {currentPoint >= SIMULATED_ROUTE.length - 1 ? "Completed" : `${currentPoint + 1}/${SIMULATED_ROUTE.length}`}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {!isSimulating ? (
            <Button variant="purple" size="md" onClick={startSimulation} disabled={currentPoint >= SIMULATED_ROUTE.length - 1}
              icon={<Bike className="h-4 w-4" />}>
              Start Tracking Simulation
            </Button>
          ) : (
            <Button variant="secondary" size="md" onClick={stopSimulation}>
              Stop Simulation
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => { setCurrentPoint(0); stopSimulation(); }}>
            Reset
          </Button>
        </div>
      </div>

      {/* Location history */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-medium text-purple-900 text-sm mb-3">Route Progress</h3>
        <div className="space-y-2">
          {SIMULATED_ROUTE.slice(0, currentPoint + 1).map((point, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center",
                idx === currentPoint ? "bg-brand-purple text-white" : "bg-purple-100 text-brand-purple")}>
                <MapPin className="h-3 w-3" />
              </div>
              <span className="text-sm text-gray-700">{point.label}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {idx === currentPoint ? "Current" : `${((idx + 1) * 2).toFixed(0)} min ago`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
