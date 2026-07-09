"use client";

import Link from "next/link";
import { Package, MapPin, Clock, Shield, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: 1,
    title: "Shop & Select OpenBox",
    description: "Browse products on the marketplace and select 'Deliver to OpenBox Locker' at checkout.",
  },
  {
    number: 2,
    title: "We Deliver to the Locker",
    description: "Your order is delivered to your chosen OpenBox locker location.",
  },
  {
    number: 3,
    title: "Receive Your Code",
    description: "Get a unique pickup code via SMS or in-app notification.",
  },
  {
    number: 4,
    title: "Pick Up Anytime",
    description: "Visit the locker, enter your code, and collect your package at your convenience.",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Pick Up on Your Schedule",
    description: "No more waiting for deliveries. Pick up your packages 24/7 at your convenience.",
    color: "text-brand-green",
    bg: "bg-brand-green/10",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your packages are stored safely in individual lockers. Only you have access.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
  {
    icon: MapPin,
    title: "Convenient Locations",
    description: "Multiple locker locations across the city. Find one near your home or office.",
    color: "text-brand-yellow-dark",
    bg: "bg-brand-yellow/10",
  },
  {
    icon: Package,
    title: "Free for You",
    description: "OpenBox pickup is free — no extra delivery charges when you choose locker delivery.",
    color: "text-brand-green",
    bg: "bg-brand-green/10",
  },
];

export default function OpenBoxPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-green/10 via-brand-yellow/5 to-brand-purple/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple-dark text-sm font-medium mb-4">
              <Package className="h-3.5 w-3.5" />
              OpenBox Package Lockers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-6">
              Your Packages,{" "}
              <span className="text-brand-purple">Your Schedule</span>
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl">
              Never miss a delivery again. Choose a nearby OpenBox locker at checkout
              and pick up your packages whenever it&apos;s convenient for you.
            </p>
            <Link href="/market">
              <Button variant="primary" size="xl" className="text-base">
                Start Shopping with OpenBox
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            How OpenBox Works
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Four simple steps from checkout to collection.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-brand-purple/20" />
              )}
              <div className="bg-white rounded-xl p-6 border border-border-light text-center relative">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-brand-purple">{step.number}</span>
                </div>
                <h3 className="font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Why Use OpenBox?
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              The smarter way to receive your packages.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-xl p-6 border border-border-light flex items-start gap-4"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", benefit.bg)}>
                  <benefit.icon className={cn("h-6 w-6", benefit.color)} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">{benefit.title}</h3>
                  <p className="text-sm text-text-secondary">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Map (placeholder) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Find a Locker Near You
          </h2>
          <p className="text-text-secondary">
            An interactive locker map is coming soon. In the meantime, select &ldquo;OpenBox Pickup&rdquo; at
            checkout to see available locations.
          </p>
        </div>
        <div className="bg-gray-100 rounded-2xl h-64 md:h-96 flex items-center justify-center border border-dashed border-border-default">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-text-muted mb-3" />
            <p className="text-sm text-text-muted">Locker Map Coming Soon</p>
            <p className="text-xs text-text-muted mt-1">50+ locations across the city</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-br from-brand-purple to-brand-purple-dark rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready for a Better Delivery Experience?
            </h2>
            <p className="text-purple-200 mb-8 max-w-lg mx-auto">
              Choose OpenBox at checkout and pick up your packages on your own time.
            </p>
            <Link href="/market">
              <Button variant="yellow" size="xl" className="text-base font-bold">
                Shop with OpenBox
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
