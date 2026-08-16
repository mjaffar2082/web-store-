"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, setQuantity, removeItem, clearCart } = useCartStore();
  const status = useAuthStore((s) => s.status);

  const handleCheckout = () => {
    if (status !== "authenticated") {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="eyebrow">Your Selection</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-line" strokeWidth={1} />
            <h2 className="mt-6 font-display text-2xl text-ink">Your bag is empty</h2>
            <p className="mt-2 text-sm text-muted">
              Discover premium products across our curated departments.
            </p>
            <Link href="/shop" className="btn-ink mt-8 px-10 py-3.5">
              Shop All
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="divide-y divide-line border border-line bg-surface">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-5 sm:gap-6">
                    {item.image && (
                      <Link href={`/product/${item.slug}`} className="shrink-0">
                        <Image src={item.image} alt={item.name} width={96} height={96} className="h-24 w-24 object-cover" />
                      </Link>
                    )}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/product/${item.slug}`} className="text-sm font-medium text-ink hover:text-accent">
                            {item.name}
                          </Link>
                          {item.variant && (
                            <p className="mt-0.5 text-xs text-muted">
                              {item.variant.name} · {item.variant.sku}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted transition-colors hover:text-danger"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-4">
                        <div className="flex items-center border border-line">
                          <button
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-ink transition-colors hover:bg-background disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-medium text-ink">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-2 text-ink transition-colors hover:bg-background disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                        <span className="font-display text-lg text-ink">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={clearCart}
                className="mt-6 text-xs uppercase tracking-wider text-muted underline-offset-4 hover:text-danger hover:underline"
              >
                Clear bag
              </button>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-line bg-surface p-6">
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  Order Summary
                </h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-muted">
                    <dt>Items ({itemCount})</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>Shipping</dt>
                    <dd>Calculated at checkout</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-3 font-medium text-ink">
                    <dt>Subtotal</dt>
                    <dd className="font-display text-xl">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>
                <button onClick={handleCheckout} className="btn-ink mt-6 w-full py-3.5">
                  Proceed to Checkout
                </button>
                <p className="mt-4 text-center text-xs text-muted">
                  Complimentary shipping on orders over {formatPrice(50000)}
                </p>
                {status !== "authenticated" && (
                  <p className="mt-3 text-center text-xs text-muted">
                    You will be asked to sign in before checking out.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}