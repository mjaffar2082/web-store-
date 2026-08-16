"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/products/product-card";

export function FeaturedProducts() {
  const { data, isLoading } = useProducts({ sort: "popular", limit: 4 });

  const products = data?.data ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">The Edit</p>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            Most Coveted
          </h2>
        </div>
        <a href="/shop?sort=popular" className="btn-outline text-sm">
          View All
        </a>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-line" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-1/3 bg-line" />
                  <div className="h-4 w-3/4 bg-line" />
                  <div className="h-4 w-1/4 bg-line" />
                </div>
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}