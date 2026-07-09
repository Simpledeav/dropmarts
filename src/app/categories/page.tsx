"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Pizza,
  Watch,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: { products: number };
}

const categoryIcons: Record<string, typeof Laptop> = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
  sports: Dumbbell,
  books: BookOpen,
  food: Pizza,
  accessories: Watch,
};

const categoryGradients: Record<string, string> = {
  electronics: "from-blue-500 to-blue-600",
  fashion: "from-pink-500 to-rose-600",
  home: "from-amber-500 to-orange-600",
  beauty: "from-purple-500 to-pink-500",
  sports: "from-green-500 to-emerald-600",
  books: "from-indigo-500 to-violet-600",
  food: "from-red-500 to-orange-600",
  accessories: "from-cyan-500 to-blue-600",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Shop by Category</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Browse thousands of products across all our categories
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 skeleton rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Laptop;
              const gradient = categoryGradients[cat.slug] || "from-gray-500 to-gray-600";
              return (
                <Link
                  key={cat.id}
                  href={`/market?category=${cat.id}`}
                  className="group bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={cn("bg-gradient-to-br p-6 flex items-center justify-center h-40", gradient)}>
                    <Icon className="h-16 w-16 text-white/90" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-text-primary group-hover:text-brand-green transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-text-muted">
                        {cat._count.products} products
                      </span>
                      <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-brand-green transition-colors group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
