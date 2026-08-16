"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Cart, CartItem, Product, ProductVariant } from "@/types";
import { useAuthStore } from "./auth-store";
import * as cartService from "@/services/cart";

function buildLocalItem(product: Product, variant: ProductVariant | null | undefined, quantity: number): CartItem {
  const price = variant?.price ?? product.discountPrice ?? product.basePrice;
  return {
    id: `local-${product.id}-${variant?.id ?? ""}`,
    quantity,
    productId: product.id,
    variantId: variant?.id ?? null,
    variant: variant
      ? { ...variant, price: Number(variant.price ?? price) }
      : null,
    name: product.name,
    slug: product.slug,
    sku: variant?.sku ?? product.sku,
    image: product.images?.[0]?.url ?? null,
    price: Number(price),
    unitPrice: Number(price),
    stock: variant ? variant.stock : product.stock,
    available: (variant ? variant.stock : product.stock) > 0,
  };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  syncing: boolean;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setFromServer: (cart: Cart) => void;
  syncToServer: () => Promise<void>;
}

function totals(items: CartItem[]) {
  return {
    subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      itemCount: 0,
      syncing: false,

      setFromServer: (cart) => {
        set({ items: cart.items, subtotal: cart.subtotal, itemCount: cart.itemCount });
      },

      fetchCart: async () => {
        const authed = useAuthStore.getState().status === "authenticated";
        if (!authed) return;
        try {
          const cart = await cartService.getCart();
          set({ items: cart.items, subtotal: cart.subtotal, itemCount: cart.itemCount });
        } catch {
          // keep local state
        }
      },

      addItem: async (product, variant, quantity = 1) => {
        const authed = useAuthStore.getState().status === "authenticated";
        if (authed) {
          const cart = await cartService.addToCart({
            productId: product.id,
            variantId: variant?.id ?? null,
            quantity,
          });
          set({ items: cart.items, subtotal: cart.subtotal, itemCount: cart.itemCount });
          return;
        }

        const { items } = get();
        const existingId = `local-${product.id}-${variant?.id ?? ""}`;
        const existing = items.find((i) => i.id === existingId);
        let next: CartItem[];
        if (existing) {
          next = items.map((i) =>
            i.id === existingId ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          next = [...items, buildLocalItem(product, variant, quantity)];
        }
        set({ items: next, ...totals(next) });
      },

      setQuantity: async (itemId, quantity) => {
        const authed = useAuthStore.getState().status === "authenticated";
        if (authed) {
          const cart = await cartService.updateCartItem(itemId, quantity);
          set({ items: cart.items, subtotal: cart.subtotal, itemCount: cart.itemCount });
          return;
        }

        const next = get().items.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
        );
        set({ items: next, ...totals(next) });
      },

      removeItem: async (itemId) => {
        const authed = useAuthStore.getState().status === "authenticated";
        if (authed) {
          const cart = await cartService.removeCartItem(itemId);
          set({ items: cart.items, subtotal: cart.subtotal, itemCount: cart.itemCount });
          return;
        }

        const next = get().items.filter((i) => i.id !== itemId);
        set({ items: next, ...totals(next) });
      },

      clearCart: async () => {
        const authed = useAuthStore.getState().status === "authenticated";
        if (authed) {
          const cart = await cartService.clearCart();
          set({ items: cart.items, subtotal: cart.subtotal, itemCount: cart.itemCount });
          return;
        }
        set({ items: [], subtotal: 0, itemCount: 0 });
      },

      syncToServer: async () => {
        const authed = useAuthStore.getState().status === "authenticated";
        const { items } = get();
        if (!authed || items.length === 0) return;
        set({ syncing: true });
        try {
          const cart = await cartService.syncCartItems(items);
          set({ items: cart.items, subtotal: cart.subtotal, itemCount: cart.itemCount });
        } finally {
          set({ syncing: false });
        }
      },
    }),
    {
      name: "saifi-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          useCartStore.setState({ items: state.items, ...totals(state.items) });
        }
      },
    }
  )
);