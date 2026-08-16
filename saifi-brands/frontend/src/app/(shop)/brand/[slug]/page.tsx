"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useBrand } from "@/hooks/use-brands";
import { ProductGrid } from "@/components/products/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: brand, isLoading, error } = useBrand(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-48 animate-pulse bg-line" />
        <div className="mb-8 flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-line" />
          <div className="h-10 w-48 animate-pulse bg-line" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-line" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="eyebrow">Not Found</p>
          <h1 className="mt-4 font-display text-3xl text-ink">Brand Unavailable</h1>
          <Link href="/shop" className="btn-outline mt-8">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const products = brand.products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: brand.name }]} />

          <div className="mt-8 flex items-center gap-6">
            {brand.logo ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line">
                <Image src={brand.logo} alt={brand.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                <span className="font-display text-2xl text-accent">{brand.name[0]}</span>
              </div>
            )}
            <div>
              <p className="eyebrow">House of</p>
              <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
                {brand.name}
              </h1>
            </div>
          </div>

          {brand.description && (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
              {brand.description}
            </p>
          )}
        </div>
      </div>

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