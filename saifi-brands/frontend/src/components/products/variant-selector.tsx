"use client";

import { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  type: string;
  label: string;
}

export function VariantSelector({ variants, selectedVariant, onSelect, type, label }: VariantSelectorProps) {
  const filtered = variants.filter((v) => v.type === type && v.isActive);

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="flex items-baseline gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
        {label}
        {selectedVariant && (
          <span className="normal-case tracking-normal text-sm font-normal text-muted">
            — {selectedVariant.name}
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2.5">
        {filtered.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock === 0;

          if (type === "color") {
            return (
              <button
                key={variant.id}
                onClick={() => !isOutOfStock && onSelect(variant)}
                disabled={isOutOfStock}
                className={`h-9 w-9 rounded-full border transition-all ${
                  isSelected ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-ink"
                } ${isOutOfStock ? "cursor-not-allowed opacity-30" : "cursor-pointer"}`}
                style={{ backgroundColor: variant.name.toLowerCase() }}
                title={`${variant.name}${isOutOfStock ? " (Out of Stock)" : ""}`}
              />
            );
          }

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              className={`border px-4 py-2.5 text-sm transition-all ${
                isSelected
                  ? "border-ink bg-ink text-background"
                  : "border-line text-ink hover:border-ink"
              } ${isOutOfStock ? "cursor-not-allowed opacity-30" : "cursor-pointer"}`}
            >
              {variant.name}
              {variant.price && (
                <span className={`ml-1 text-xs ${isSelected ? "text-background/70" : "text-muted"}`}>
                  ({formatPrice(Number(variant.price))})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}