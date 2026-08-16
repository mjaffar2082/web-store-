import Link from "next/link";
import { ArrowRight, BadgeCheck, Truck, Gem } from "lucide-react";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoryShowcase } from "@/components/home/category-showcase";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-10">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-accent" />
              <p className="eyebrow">Est. — The Considered Edit</p>
            </div>
            <h1 className="mt-8 font-display text-5xl leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
              Authenticity,
              <br />
              <span className="italic text-accent">Curated</span> for You
            </h1>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              A refined collection of exceptional products across electronics,
              fashion and home. Every piece selected with intention — nothing
              generic, nothing ordinary.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/shop" className="btn-ink">
                Shop the Collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop?sort=popular" className="btn-outline">
                Most Popular
              </Link>
            </div>
          </div>

          </div>
      </section>

      {/* Value props */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <BadgeCheck className="h-7 w-7 text-accent" strokeWidth={1.25} />
            <h3 className="mt-4 font-display text-lg text-ink">
              Authenticity Guaranteed
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Every product is verified and sourced from trusted, genuine
              partners.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Gem className="h-7 w-7 text-accent" strokeWidth={1.25} />
            <h3 className="mt-4 font-display text-lg text-ink">
              A Curated Selection
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              We edit before we sell — only exceptional pieces make the
              collection.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Truck className="h-7 w-7 text-accent" strokeWidth={1.25} />
            <h3 className="mt-4 font-display text-lg text-ink">
              Worldwide Delivery
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Complimentary shipping on orders over $150, delivered with care.
            </p>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <div className="py-20 sm:py-24">
        <FeaturedProducts />
      </div>

      {/* Editorial statement band */}
      <section className="border-y border-line bg-ink">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="eyebrow">Our Philosophy</p>
          <blockquote className="mt-6 font-display text-3xl leading-snug text-[#f5efe4] sm:text-4xl">
            &ldquo;We believe what you own should mean something. Less noise.
            <span className="italic text-gold"> More intention.</span>&rdquo;
          </blockquote>
          <Link
            href="/shop"
            className="mt-10 inline-flex items-center gap-2 text-[0.8125rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-white"
          >
            Begin the Edit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Category showcase */}
      <div className="py-20 sm:py-24">
        <CategoryShowcase />
      </div>
    </div>
  );
}