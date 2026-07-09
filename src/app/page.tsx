"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Store,
  Bike,
  Package,
  Star,
  Shield,
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Pizza,
  Watch,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  vendorName: string;
  rating: number | null;
  reviewCount: number;
  status: string;
}

const categories = [
  { name: "Electronics", icon: Laptop, gradient: "from-blue-500 to-blue-600", slug: "electronics" },
  { name: "Fashion", icon: Shirt, gradient: "from-pink-500 to-rose-600", slug: "fashion" },
  { name: "Home", icon: Home, gradient: "from-amber-500 to-orange-600", slug: "home" },
  { name: "Beauty", icon: Sparkles, gradient: "from-purple-500 to-pink-500", slug: "beauty" },
  { name: "Sports", icon: Dumbbell, gradient: "from-green-500 to-emerald-600", slug: "sports" },
  { name: "Books", icon: BookOpen, gradient: "from-indigo-500 to-violet-600", slug: "books" },
  { name: "Food", icon: Pizza, gradient: "from-red-500 to-orange-600", slug: "food" },
  { name: "Accessories", icon: Watch, gradient: "from-cyan-500 to-blue-600", slug: "accessories" },
];

const howItWorks = [
  {
    icon: ShoppingBag,
    title: "Browse & Shop",
    description: "Explore thousands of products from trusted vendors across categories.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Store,
    title: "Sell Your Products",
    description: "Join as a vendor and reach thousands of customers across Nigeria.",
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    icon: Bike,
    title: "Deliver With Us",
    description: "Become a rider and earn money delivering orders in your area.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Package,
    title: "OpenBox Lockers",
    description: "Pick up your packages at convenient locker locations near you.",
    gradient: "from-cyan-500 to-blue-600",
  },
];

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || 600;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const count = 40;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 1,
        color: `rgba(16, 185, 129, ${Math.random() * 0.3 + 0.1})`,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("transition-transform duration-200 ease-out", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }, delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn("opacity-0 translate-y-8 transition-all duration-700 ease-out", className)}
    >
      {children}
    </div>
  );
}

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-[15%] w-24 h-24 border-2 border-brand-green/20 rounded-full animate-pulse-soft" style={{ animationDuration: "6s" }} />
      <div className="absolute top-40 right-[20%] w-16 h-16 bg-brand-purple/10 rounded-xl rotate-45 animate-pulse-soft" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-32 left-[25%] w-20 h-20 bg-brand-yellow/10 rounded-2xl animate-pulse-soft" style={{ animationDuration: "7s" }} />
      <div className="absolute bottom-20 right-[15%] w-32 h-32 border-2 border-brand-purple/15 rounded-full animate-pulse-soft" style={{ animationDuration: "9s" }} />
    </div>
  );
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?limit=8&sort=newest");
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ───── HERO ───── */}
      <section className="relative min-h-[90vh] flex items-center bg-gray-950 overflow-hidden">
        <ParticleBackground />
        <FloatingShapes />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-fade-in">
                <Star className="h-3.5 w-3.5 fill-emerald-400" />
                Nigeria&apos;s Trusted Multi-Vendor Marketplace
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Shop. Sell.
                <br />
                Deliver.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300">
                  Connected.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">
                The all-in-one marketplace where buyers find quality products,
                vendors grow their business, and riders earn on their own schedule.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/market">
                  <Button variant="primary" size="xl" className="text-base shadow-lg shadow-emerald-500/25">
                    Start Shopping
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/vendor/onboarding">
                  <Button variant="yellow" size="xl" className="text-base shadow-lg shadow-amber-500/25">
                    Start Selling
                  </Button>
                </Link>
                <Link href="/rider/onboarding">
                  <Button variant="purple" size="xl" className="text-base shadow-lg shadow-violet-500/25">
                    Become a Rider
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8 pt-4 border-t border-white/10">
                {[
                  { value: "10K+", label: "Products" },
                  { value: "500+", label: "Vendors" },
                  { value: "100+", label: "Riders" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-white font-bold text-xl">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="relative w-80 h-80">
                {[
                  { icon: ShoppingBag, color: "from-emerald-400 to-teal-500", x: 0, y: 0, delay: "0s" },
                  { icon: Store, color: "from-amber-400 to-yellow-500", x: 160, y: -40, delay: "1s" },
                  { icon: Bike, color: "from-violet-400 to-purple-500", x: 180, y: 100, delay: "2s" },
                  { icon: Package, color: "from-cyan-400 to-blue-500", x: -20, y: 160, delay: "0.5s" },
                ].map((item) => (
                  <div
                    key={item.delay}
                    className={cn(
                      "absolute w-28 h-28 rounded-2xl bg-gradient-to-br flex items-center justify-center",
                      "shadow-2xl animate-fade-in",
                      item.color
                    )}
                    style={{
                      left: item.x,
                      top: item.y,
                      animationDelay: item.delay,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CATEGORY RAIL ───── */}
      <AnimatedSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 border border-white/20 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Shop by Category</h2>
              <Link
                href="/categories"
                className="text-sm text-brand-green hover:text-brand-green-dark font-medium flex items-center gap-1 group"
              >
                View All{" "}
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/market/${cat.slug}`}
                    className="flex flex-col items-center gap-3 min-w-[90px] group"
                  >
                    <TiltCard>
                      <div
                        className={cn(
                          "w-20 h-20 rounded-2xl flex items-center justify-center",
                          "transition-all duration-300 group-hover:shadow-xl",
                          `bg-gradient-to-br ${cat.gradient}`
                        )}
                      >
                        <Icon className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>
                    </TiltCard>
                    <span className="text-xs font-semibold text-text-secondary text-center group-hover:text-brand-green transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ───── HOW IT WORKS ───── */}
      <AnimatedSection delay={300}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-brand-green uppercase tracking-widest">Ecosystem</span>
            <h2 className="text-4xl font-bold text-text-primary mt-3 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-lg">
              A complete ecosystem connecting buyers, sellers, and riders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <TiltCard key={item.title}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-light hover:shadow-xl transition-all duration-300 group h-full">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5",
                        "shadow-lg transition-transform duration-300 group-hover:scale-110",
                        item.gradient
                      )}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </section>
      </AnimatedSection>

      {/* ───── FEATURED PRODUCTS ───── */}
      <section className="bg-gray-50/80 py-24">
        <AnimatedSection delay={200}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold text-brand-green uppercase tracking-widest">New Arrivals</span>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-3">
                  Featured Products
                </h2>
              </div>
              <Link href="/market">
                <Button variant="outline" size="md" className="hidden sm:flex">
                  View All{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.imageUrl || undefined}
                    vendorName={product.vendorName}
                    rating={product.rating || undefined}
                    reviewCount={product.reviewCount}
                    status={product.status}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border-default">
                <ShoppingBag className="h-16 w-16 mx-auto text-text-muted mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">No products yet</h3>
                <p className="text-text-secondary">Products will appear once vendors start listing them.</p>
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link href="/market">
                <Button variant="outline" size="md">
                  View All Products{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ───── STATS ───── */}
      <AnimatedSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10,000+", label: "Products", icon: ShoppingBag, gradient: "from-emerald-500 to-teal-500" },
              { value: "500+", label: "Vendors", icon: Store, gradient: "from-amber-500 to-yellow-500" },
              { value: "100+", label: "Riders", icon: Bike, gradient: "from-violet-500 to-purple-500" },
              { value: "50+", label: "Locker Locations", icon: Package, gradient: "from-cyan-500 to-blue-500" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <TiltCard key={stat.label}>
                  <div className="bg-white rounded-2xl p-6 border border-border-light text-center hover:shadow-lg transition-all duration-300">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4",
                        stat.gradient
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-text-primary">{stat.value}</div>
                    <div className="text-sm text-text-muted mt-1">{stat.label}</div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </section>
      </AnimatedSection>

      {/* ───── CTA ───── */}
      <AnimatedSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-3xl p-10 md:p-16 text-white text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Selling?</h2>
              <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg">
                Join thousands of vendors growing their business on our platform.
                Set up your store in minutes.
              </p>
              <Link href="/vendor/onboarding">
                <Button
                  variant="yellow"
                  size="xl"
                  className="text-base font-bold shadow-2xl shadow-amber-500/30"
                >
                  <Store className="h-5 w-5" />
                  Open Your Store Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
