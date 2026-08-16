import { ProductGrid } from "@/components/products/product-grid";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-24 animate-pulse bg-line" />
        <div className="mb-10 h-12 w-48 animate-pulse bg-line" />
        <ProductGrid products={[]} isLoading={true} />
      </div>
    </div>
  );
}