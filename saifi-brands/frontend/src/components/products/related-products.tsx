"use client";

import { Product } from "@/types";
import { ProductCard } from "./product-card";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-20 border-t border-line pt-12">
      <p className="eyebrow">Complete the Look</p>
      <h2 className="mt-3 font-display text-3xl text-ink">Related Pieces</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}