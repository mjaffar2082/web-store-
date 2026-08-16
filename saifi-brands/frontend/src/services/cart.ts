import api from "./api";
import { Cart, CartItem } from "@/types";

export interface AddToCartInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export async function getCart(): Promise<Cart> {
  const response = await api.get("/cart");
  return response.data.data;
}

export async function addToCart(data: AddToCartInput): Promise<Cart> {
  const response = await api.post("/cart", data);
  return response.data.data;
}

export async function updateCartItem(id: string, quantity: number): Promise<Cart> {
  const response = await api.patch(`/cart/${id}`, { quantity });
  return response.data.data;
}

export async function removeCartItem(id: string): Promise<Cart> {
  const response = await api.delete(`/cart/${id}`);
  return response.data.data;
}

export async function clearCart(): Promise<Cart> {
  const response = await api.post("/cart/clear");
  return response.data.data;
}

export async function syncCartItems(items: CartItem[]): Promise<Cart> {
  let cart: Cart | null = null;
  for (const item of items) {
    cart = await addToCart({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    });
  }
  return cart ?? (await getCart());
}