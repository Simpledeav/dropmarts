"use client";

import { MapPin, CheckCircle2, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

const coverageAreas = [
  {
    city: "Lagos",
    zones: [
      { name: "Ikeja", status: "active" as const },
      { name: "Victoria Island", status: "active" as const },
      { name: "Lekki Phase 1", status: "active" as const },
      { name: "Yaba", status: "active" as const },
      { name: "Surulere", status: "active" as const },
      { name: "Gbagada", status: "active" as const },
      { name: "Ajah", status: "active" as const },
      { name: "Maryland", status: "active" as const },
    ],
  },
  {
    city: "Abuja",
    zones: [
      { name: "Central Area", status: "active" as const },
      { name: "Wuse 2", status: "active" as const },
      { name: "Maitama", status: "coming_soon" as const },
      { name: "Garki", status: "active" as const },
      { name: "Asokoro", status: "coming_soon" as const },
    ],
  },
  {
    city: "Port Harcourt",
    zones: [
      { name: "GRA Phase 1", status: "active" as const },
      { name: "GRA Phase 2", status: "active" as const },
      { name: "Rumuokwuta", status: "coming_soon" as const },
    ],
  },
  {
    city: "Ibadan",
    zones: [
      { name: "Bodija", status: "active" as const },
      { name: "Iwo Road", status: "active" as const },
      { name: "Ring Road", status: "coming_soon" as const },
    ],
  },
  {
    city: "Enugu",
    zones: [
      { name: "Independence Layout", status: "active" as const },
      { name: "New Haven", status: "coming_soon" as const },
    ],
  },
  {
    city: "Kano",
    zones: [
      { name: "Nassarawa", status: "coming_soon" as const },
      { name: "Fagge", status: "coming_soon" as const },
    ],
  },
];

export default function CoveragePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Delivery Coverage</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We&apos;re expanding across Nigeria. Check if we deliver to your area.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coverageAreas.map((area) => (
            <div key={area.city} className="bg-white rounded-xl border border-border-light p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-brand-green" />
                </div>
                <h3 className="font-bold text-lg text-text-primary">{area.city}</h3>
              </div>
              <div className="space-y-2">
                {area.zones.map((zone) => (
                  <div key={zone.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {zone.status === "active" ? (
                        <CheckCircle2 className="h-4 w-4 text-brand-green" />
                      ) : (
                        <Bike className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={cn(
                        "text-sm",
                        zone.status === "active" ? "text-text-primary" : "text-text-muted"
                      )}>
                        {zone.name}
                      </span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full uppercase",
                      zone.status === "active"
                        ? "bg-brand-green/10 text-brand-green-dark"
                        : "bg-yellow-50 text-yellow-700"
                    )}>
                      {zone.status === "active" ? "Active" : "Coming Soon"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
