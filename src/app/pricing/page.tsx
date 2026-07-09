import { Check, Store, Bike, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Buyer",
    description: "Shop from thousands of trusted vendors",
    price: "Free",
    features: [
      "Browse all products",
      "Track orders in real-time",
      "OpenBox locker pickup",
      "24/7 customer support",
      "Secure payments",
    ],
    icon: Users,
    href: "/signup",
    popular: false,
  },
  {
    name: "Vendor",
    description: "Start selling and grow your business",
    price: "Free to start",
    features: [
      "Unlimited product listings",
      "Vendor dashboard & analytics",
      "Order management",
      "Marketing tools",
      "Payout management",
      "Priority support",
      "Bulk import tools",
    ],
    icon: Store,
    href: "/vendor/onboarding",
    popular: true,
  },
  {
    name: "Rider",
    description: "Earn money delivering on your schedule",
    price: "Free to join",
    features: [
      "Flexible delivery hours",
      "Real-time order tracking",
      "Competitive payouts",
      "Coverage area management",
      "Delivery history",
      "Rider support",
    ],
    icon: Bike,
    href: "/rider/onboarding",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join Dropmart for free. No hidden fees. No surprises.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular ? "border-brand-green shadow-lg" : "border-border-light"
                }`}
              >
                {plan.popular && (
                  <div className="bg-brand-green text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-6 md:p-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? "bg-brand-green/10" : "bg-gray-100"
                  }`}>
                    <Icon className={`h-6 w-6 ${plan.popular ? "text-brand-green" : "text-text-primary"}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                  <p className="text-sm text-text-secondary mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-text-primary mb-6">{plan.price}</div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <Button
                      variant={plan.popular ? "primary" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
