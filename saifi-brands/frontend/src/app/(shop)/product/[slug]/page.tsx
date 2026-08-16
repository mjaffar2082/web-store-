"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Heart, Minus, Plus, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useWishlist, useAddToWishlist, useRemoveWishlistByProduct } from "@/hooks/use-wishlist";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { ProductGallery } from "@/components/products/product-gallery";
import { VariantSelector } from "@/components/products/variant-selector";
import { StockBadge } from "@/components/products/stock-badge";
import { RelatedProducts } from "@/components/products/related-products";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ReviewSection } from "@/components/products/review-section";
import { formatPrice, getDiscountedPrice, getDiscountPercentage } from "@/lib/utils";
import { ProductVariant } from "@/types";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: product, isLoading, error } = useProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const status = useAuthStore((s) => s.status);
  const { data: wishlist } = useWishlist(status === "authenticated");
  const addToWishlist = useAddToWishlist();
  const removeWishlistByProduct = useRemoveWishlistByProduct();

  const categorySlug = product?.category?.slug;
  const { data: relatedData } = useProducts(
    categorySlug ? { category: categorySlug, limit: 4 } : undefined
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-48 animate-pulse bg-line" />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse bg-line" />
          <div className="space-y-5">
            <div className="h-3 w-24 animate-pulse bg-line" />
            <div className="h-10 w-3/4 animate-pulse bg-line" />
            <div className="h-6 w-32 animate-pulse bg-line" />
            <div className="h-20 w-full animate-pulse bg-line" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="eyebrow">Not Found</p>
          <h1 className="mt-4 font-display text-3xl text-ink">Product Unavailable</h1>
          <p className="mt-3 text-sm text-muted">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link href="/shop" className="btn-outline mt-8">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const price = getDiscountedPrice(product.basePrice, product.discountPrice);
  const discount = getDiscountPercentage(product.basePrice, product.discountPrice);
  const sizes = product.variants?.filter((v) => v.type === "size") ?? [];
  const colors = product.variants?.filter((v) => v.type === "color") ?? [];
  const relatedProducts = relatedData?.data?.filter((p) => p.id !== product.id) ?? [];
  const inWishlist = wishlist?.some((item) => item.product.id === product.id) ?? false;

  const handleAddToBag = async () => {
    if (product.stock === 0) return;
    setAdding(true);
    try {
      await addItem(product, selectedVariant, quantity);
      toast.success("Added to your bag");
    } catch {
      toast.error("Could not add this item to your bag");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (status !== "authenticated") {
      router.push("/login?redirect=" + encodeURIComponent(`/product/${slug}`));
      return;
    }
    try {
      if (inWishlist) {
        await removeWishlistByProduct.mutateAsync(product.id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist.mutateAsync(product.id);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Shop", href: "/shop" },
              ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
              { label: product.name },
            ]}
          />
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="lg:pl-4">
            {product.brand && (
              <Link
                href={`/brand/${product.brand.slug}`}
                className="eyebrow transition-colors hover:text-ink"
              >
                {product.brand.name}
              </Link>
            )}

            <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl text-ink">
                {formatPrice(price)}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-muted line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="bg-accent/15 px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-accent-hover">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <StockBadge stock={product.stock} />
            </div>

            <div className="mt-8 border-t border-line pt-8">
              <VariantSelector
                variants={sizes}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
                type="size"
                label="Size"
              />
              <div className="mt-6">
                <VariantSelector
                  variants={colors}
                  selectedVariant={selectedVariant}
                  onSelect={setSelectedVariant}
                  type="color"
                  label="Colour"
                />
              </div>
            </div>

            <div className="mt-8 flex items-stretch gap-3">
              <div className="flex items-center border border-line">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3.5 text-ink transition-colors hover:bg-background"
                >
                  <Minus className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <span className="min-w-[2.5rem] text-center text-sm font-medium text-ink">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3.5 text-ink transition-colors hover:bg-background"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <button
                onClick={handleAddToBag}
                className="btn-ink flex-1"
                disabled={product.stock === 0 || adding}
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                {product.stock === 0 ? "Sold Out" : adding ? "Adding..." : "Add to Bag"}
              </button>
              <button
                onClick={handleWishlist}
                className={`flex items-center justify-center border px-4 transition-colors ${
                  inWishlist ? "border-accent bg-accent/10 text-accent-hover" : "border-line text-ink hover:bg-background"
                }`}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className="h-5 w-5" strokeWidth={1.5} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            <ul className="mt-8 space-y-3 border-t border-line pt-8 text-sm text-muted">
              <li className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-accent" strokeWidth={1.5} />
                Complimentary shipping on orders over $150
              </li>
              <li className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 text-accent" strokeWidth={1.5} />
                30-day returns, no questions asked
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.5} />
                Authenticity guaranteed on every piece
              </li>
            </ul>

            {product.description && (
              <div className="mt-8 border-t border-line pt-8">
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  Description
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {product.description}
                </p>
              </div>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-8 border-t border-line pt-8">
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  Specifications
                </h2>
                <dl className="mt-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-line py-2.5 text-sm last:border-0"
                    >
                      <dt className="text-muted">{key}</dt>
                      <dd className="text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        <ReviewSection slug={slug} reviews={product.reviews ?? []} />

        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}