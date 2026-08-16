"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";

export function CategoryShowcase() {
  const { data: categories } = useCategories();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Departments</p>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-2 text-[0.8125rem] uppercase tracking-[0.14em] text-accent transition-colors hover:text-ink"
        >
          Browse All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.slice(0, 4).map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative block overflow-hidden bg-line"
          >
            <div
              className="aspect-[3/4] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: cat.image
                  ? `url(${cat.image})`
                  : undefined,
              }}
            />
            {!cat.image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl text-ink/60">
                  {cat.name}
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/70 via-transparent to-transparent p-5">
              <span className="font-display text-lg text-white">{cat.name}</span>
              <span className="mt-1 flex items-center gap-1.5 text-[0.625rem] uppercase tracking-[0.2em] text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}