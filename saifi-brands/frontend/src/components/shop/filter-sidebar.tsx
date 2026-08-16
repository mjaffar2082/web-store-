"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";

interface FilterSidebarProps {
  filters: Record<string, string | number | undefined>;
  onChange: (filters: Record<string, string | number | undefined>) => void;
  isOpen: boolean;
  onToggle: () => void;
  variant?: "drawer" | "static";
}

export function FilterSidebar({ filters, onChange, isOpen, onToggle, variant = "drawer" }: FilterSidebarProps) {
  const isStatic = variant === "static";
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const updateFilter = (key: string, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  const optionClass = (active: boolean) =>
    `block w-full text-left px-2 py-1.5 text-sm transition-colors ${
      active
        ? "bg-ink text-background"
        : "text-muted hover:bg-background hover:text-ink"
    }`;

  return (
    <>
      {!isStatic && (
        <button
          onClick={onToggle}
          className="flex items-center gap-2 border border-line bg-surface px-4 py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-background lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          Filters
          {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        </button>
      )}

      {(isStatic || isOpen) && (
        <aside
          className={`${isStatic ? "" : "fixed inset-y-0 left-0 z-40 w-80 transform bg-background p-6 shadow-2xl transition-transform lg:hidden "}${
            isStatic || isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {!isStatic && (
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Filters</h2>
              <button onClick={onToggle} className="text-ink">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          )}

        <div className="space-y-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
                Categories
              </h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[0.6875rem] uppercase tracking-[0.14em] text-accent hover:text-ink">
                  Clear all
                </button>
              )}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter("category", undefined)}
                className={optionClass(!filters.category)}
              >
                All Categories
              </button>
              {categories
                ?.filter((cat) => !cat.parentId)
                .map((cat) => (
                  <div key={cat.id}>
                    <button
                      onClick={() => updateFilter("category", cat.slug)}
                      className={optionClass(filters.category === cat.slug)}
                    >
                      {cat.name}
                    </button>
                    {cat.children && cat.children.length > 0 && (
                      <div className="space-y-1 pl-4">
                        {cat.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => updateFilter("category", child.slug)}
                            className={optionClass(filters.category === child.slug)}
                          >
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
              Brands
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter("brand", undefined)}
                className={optionClass(!filters.brand)}
              >
                All Brands
              </button>
              {brands?.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateFilter("brand", b.slug)}
                  className={optionClass(filters.brand === b.slug)}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
              Price Range
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) => updateFilter("minPrice", e.target.value || undefined)}
                className="w-full border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <span className="text-line">—</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) => updateFilter("maxPrice", e.target.value || undefined)}
                className="w-full border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
              Rating
            </h3>
            <div className="space-y-1">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter("rating", filters.rating === String(rating) ? undefined : String(rating))}
                  className={optionClass(filters.rating === String(rating))}
                >
                  {rating}+ stars
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={filters.inStock === "true"}
              onChange={(e) => updateFilter("inStock", e.target.checked ? "true" : undefined)}
              className="h-4 w-4 rounded-sm border-line accent-accent focus:ring-accent"
            />
            <span className="text-sm text-ink">In Stock Only</span>
          </label>
        </div>
        </aside>
      )}

      {!isStatic && isOpen && (
        <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={onToggle} />
      )}
    </>
  );
}