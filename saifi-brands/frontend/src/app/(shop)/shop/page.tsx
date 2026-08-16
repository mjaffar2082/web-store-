"use client";

import { useState, useCallback } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { SortSelect } from "@/components/shop/sort-select";
import { SearchBar } from "@/components/shop/search-bar";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useProducts } from "@/hooks/use-products";

export default function ShopPage() {
  const [filters, setFilters] = useState<Record<string, string | number | undefined>>({});
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const queryParams: Record<string, string | number | undefined> = {
    ...filters,
    sort,
    q: search || undefined,
    page,
  };

  const { data, isLoading } = useProducts(queryParams);

  const handleFilterChange = useCallback((newFilters: Record<string, string | number | undefined>) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Shop" }]} />
          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">The Collection</p>
              <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
                Shop
              </h1>
              <p className="mt-2 text-sm text-muted">
                Browse the full edit of premium products
              </p>
            </div>
            <div className="w-full max-w-sm">
              <SearchBar value={search} onChange={handleSearchChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              isOpen={filterOpen}
              onToggle={() => setFilterOpen(!filterOpen)}
            />
            <SortSelect value={sort} onChange={handleSortChange} />
          </div>
          {meta && (
            <p className="hidden text-xs uppercase tracking-[0.18em] text-muted sm:block">
              {meta.total} pieces
            </p>
          )}
        </div>

        <div className="flex gap-10">
          <div className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              isOpen={true}
              onToggle={() => {}}
              variant="static"
            />
          </div>

          <div className="flex-1">
            <ProductGrid products={products} isLoading={isLoading} />

            {meta && meta.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border border-line px-4 py-2.5 text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-background disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-10 w-10 items-center justify-center border text-sm transition-colors ${
                        page === p
                          ? "border-ink bg-ink text-background"
                          : "border-line text-muted hover:border-ink hover:text-ink"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="border border-line px-4 py-2.5 text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-background disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}