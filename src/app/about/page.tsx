import { Shield, Users, TrendingUp, Award, Store, Bike, Package } from "lucide-react";
import { BRAND } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About {BRAND.name}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We&apos;re building the all-in-one marketplace that connects buyers, vendors, and riders across Nigeria.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">Our Mission</h2>
            <p className="text-text-secondary mb-4">
              At {BRAND.name}, we believe in the power of connection. Our platform brings together
              quality vendors, reliable riders, and savvy shoppers to create a seamless marketplace
              experience that empowers local businesses and communities.
            </p>
            <p className="text-text-secondary">
              From cutting-edge electronics to handcrafted fashion, we provide a trusted space
              where every transaction is secure, every delivery is tracked, and every customer
              is valued.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Store, label: "500+ Vendors" },
              { icon: Users, label: "50K+ Buyers" },
              { icon: Bike, label: "100+ Riders" },
              { icon: Package, label: "50+ Lockers" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 border border-border-light text-center">
                <stat.icon className="h-8 w-8 mx-auto text-brand-green mb-2" />
                <p className="font-bold text-text-primary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Trust & Security", desc: "Every transaction is protected. We verify all vendors and riders to ensure a safe marketplace." },
              { icon: TrendingUp, title: "Empowerment", desc: "We provide tools and opportunities for small businesses and independent workers to thrive." },
              { icon: Award, title: "Quality", desc: "We curate our marketplace to ensure only the best products and services reach our customers." },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-6 border border-border-light">
                <v.icon className="h-10 w-10 text-brand-green mb-4" />
                <h3 className="font-bold text-text-primary mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
