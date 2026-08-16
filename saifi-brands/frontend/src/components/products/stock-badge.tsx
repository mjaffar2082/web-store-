"use client";

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center border border-danger/40 bg-danger/10 px-3 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-danger">
        Sold Out
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center border border-warning/40 bg-warning/10 px-3 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-warning">
        Only {stock} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center border border-success/40 bg-success/10 px-3 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-success">
      In Stock
    </span>
  );
}