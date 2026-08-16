"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCategory } from "@/hooks/use-categories";
import { ProductGrid } from "@/components/products/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: category, isLoading, error } = useCategory(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-48 animate-pulse bg-line" />
        <div className="mb-8 h-10 w-64 animate-pulse bg-line" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-line" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="eyebrow">Not Found</p>
          <h1 className="mt-4 font-display text-3xl text-ink">Category Unavailable</h1>
          <Link href="/shop" className="btn-outline mt-8">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const products = category.products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />

          <div className="mt-8 max-w-2xl">
            <p className="eyebrow">Department</p>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {category.image && (
        <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="h-56 w-full bg-cover bg-center sm:h-72"
            style={{ backgroundImage: `url(${category.image})` }}
          />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {products.length} pieces
          </p>
          <Link
            href="/shop"
            className="text-[0.6875rem] uppercase tracking-[0.16em] text-accent transition-colors hover:text-ink"
          >
            View All Shop
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}