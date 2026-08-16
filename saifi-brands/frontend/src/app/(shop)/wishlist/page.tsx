"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist, useRemoveWishlistByProduct } from "@/hooks/use-wishlist";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatPrice } from "@/lib/utils";
import { RequireAuth } from "@/components/shared/route-guards";
import { toast } from "sonner";

function WishlistContent() {
  const { data: wishlist, isLoading } = useWishlist();
  const remove = useRemoveWishlistByProduct();
  const addItem = useCartStore((s) => s.addItem);
  const status = useAuthStore((s) => s.status);

  if (isLoading) {
    return (
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse border border-line bg-surface" />
        ))}
      </div>
    );
  }

  const items = wishlist ?? [];

  return (
    <>
      <p className="eyebrow">Saved For Later</p>
      <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Your Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-line" strokeWidth={1} />
          <h2 className="mt-6 font-display text-2xl text-ink">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted">
            Tap the heart on any product to keep it here for later.
          </p>
          <Link href="/shop" className="btn-ink mt-8 px-10 py-3.5">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const product = item.product;
            const price = product.discountPrice ?? product.basePrice;
            return (
              <div key={item.id} className="group border border-line bg-surface">
                <Link href={`/product/${product.slug}`} className="block aspect-[3/4] overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={400}
                      height={533}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-background text-xs text-muted">
                      No image
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <Link href={`/product/${product.slug}`} className="block truncate text-sm font-medium text-ink hover:text-accent">
                    {product.name}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm text-ink">{formatPrice(price)}</span>
                    {product.discountPrice && (
                      <span className="text-xs text-muted line-through">{formatPrice(product.basePrice)}</span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await addItem(product, null, 1);
                          toast.success("Added to your bag");
                        } catch {
                          toast.error("Could not add item");
                        }
                      }}
                      disabled={product.stock === 0 || status !== "authenticated"}
                      className="flex flex-1 items-center justify-center gap-2 border border-ink py-2 text-xs uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-background disabled:opacity-40"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {product.stock === 0 ? "Sold Out" : "Add to Bag"}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await remove.mutateAsync(product.id);
                          toast.success("Removed from wishlist");
                        } catch {
                          toast.error("Could not remove item");
                        }
                      }}
                      aria-label="Remove from wishlist"
                      className="border border-line p-2 text-muted transition-colors hover:border-danger hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <WishlistContent />
        </div>
      </div>
    </RequireAuth>
  );
}