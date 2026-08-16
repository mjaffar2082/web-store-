"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getDiscountedPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlist, useAddToWishlist, useRemoveWishlistByProduct } from "@/hooks/use-wishlist";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const price = getDiscountedPrice(product.basePrice, product.discountPrice);
  const discount = getDiscountPercentage(product.basePrice, product.discountPrice);
  const image = product.images?.[0];
  const addItem = useCartStore((s) => s.addItem);
  const status = useAuthStore((s) => s.status);
  const { data: wishlist } = useWishlist(status === "authenticated");
  const addToWishlist = useAddToWishlist();
  const removeWishlistByProduct = useRemoveWishlistByProduct();
  const inWishlist = wishlist?.some((item) => item.product.id === product.id) ?? false;

  const handleAddToBag = async () => {
    try {
      await addItem(product, null, 1);
      toast.success("Added to your bag");
    } catch {
      toast.error("Could not add this item");
    }
  };

  const handleWishlist = async () => {
    if (status !== "authenticated") {
      router.push("/login?redirect=" + encodeURIComponent(`/product/${product.slug}`));
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
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-line">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-lg text-ink/50">{product.name}</span>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-background">
            Save {discount}%
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-[1px]">
            <span className="border border-background/60 px-4 py-1.5 text-[0.625rem] uppercase tracking-[0.2em] text-background">
              Sold Out
            </span>
          </div>
        )}

        <button
          onClick={handleWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
            inWishlist ? "bg-accent/15 text-accent-hover opacity-100" : "bg-surface/90 text-ink opacity-0 hover:bg-surface group-hover:opacity-100"
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="h-4 w-4" strokeWidth={1.5} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-accent/60 via-accent to-accent/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        {product.brand && (
          <p className="text-[0.625rem] uppercase tracking-[0.22em] text-accent">
            {product.brand.name}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-base leading-snug text-ink transition-colors group-hover:text-accent line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-sm font-medium tracking-wide text-ink">
            {formatPrice(price)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToBag}
          className="mt-3 flex w-full items-center justify-center border border-ink py-2.5 text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-background disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Sold Out" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}