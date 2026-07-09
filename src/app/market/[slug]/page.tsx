"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MarketCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [error, setError] = useState(false);

  useEffect(() => {
    async function redirectToCategory() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const categories = data.categories || [];
        const category = categories.find(
          (c: { slug: string }) => c.slug === slug
        );
        if (category) {
          router.replace(`/market?category=${category.id}`);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    }
    redirectToCategory();
  }, [slug, router]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Category not found</h2>
          <p className="text-text-secondary mb-4">The category you&apos;re looking for doesn&apos;t exist.</p>
          <a href="/market" className="text-brand-green hover:underline">Browse all products</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-2 text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading category...</span>
      </div>
    </div>
  );
}
