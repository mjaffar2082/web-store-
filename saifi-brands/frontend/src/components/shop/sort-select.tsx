"use client";

import { ArrowUpDown } from "lucide-react";

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "popular", label: "Most Popular" },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted" strokeWidth={1.5} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line bg-surface px-3 py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] text-ink focus:border-accent focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}