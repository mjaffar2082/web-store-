"use client";

import { useState } from "react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";

export function SiteFooter() {
  const { data: categories } = useCategories();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const topCategories = categories?.slice(0, 4) ?? [];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <footer className="mt-24 bg-ink text-[#d3c8b4]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex flex-col leading-none">
              <span className="font-display text-4xl tracking-[0.04em] text-[#f5efe4]">
                Saifi
              </span>
              <span className="mt-2 text-[0.625rem] uppercase tracking-[0.42em] text-gold">
                Brands
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#a89c86]">
              A considered edit of exceptional products across electronics,
              fashion and home — sourced with intention, delivered with care.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[0.6875rem] uppercase tracking-[0.28em] text-gold">
              Shop
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <Link href="/shop" className="transition-colors hover:text-white">
                  Shop All
                </Link>
              </li>
              {topCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop?sort=popular" className="transition-colors hover:text-white">
                  Most Popular
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-[0.6875rem] uppercase tracking-[0.28em] text-gold">
              The Edit
            </h3>
            <p className="mt-6 text-sm leading-relaxed text-[#a89c86]">
              Join our newsletter for new arrivals, private sales and stories
              from the studio.
            </p>
            {subscribed ? (
              <p className="mt-4 border border-gold/40 px-4 py-3 text-sm text-gold">
                Thank you — welcome to The Edit.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-[#7f7463] focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 border border-gold px-5 text-[0.6875rem] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-[#7f7463] sm:flex-row">
          <p>© {new Date().getFullYear()} Saifi Brands. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">Crafted for the considered</p>
        </div>
      </div>
    </footer>
  );
}