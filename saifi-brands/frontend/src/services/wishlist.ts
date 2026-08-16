import api from "./api";
import { WishlistItem, Product } from "@/types";

export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await api.get("/wishlist");
  return response.data.data;
}

export async function addToWishlist(productId: string): Promise<WishlistItem[]> {
  const response = await api.post("/wishlist", { productId });
  return response.data.data;
}

export async function removeWishlistItem(id: string): Promise<WishlistItem[]> {
  const response = await api.delete(`/wishlist/${id}`);
  return response.data.data;
}

export async function removeWishlistByProduct(productId: string): Promise<WishlistItem[]> {
  const response = await api.delete(`/wishlist/product/${productId}`);
  return response.data.data;
}

export async function addReview(slug: string, data: { rating: number; title?: string; comment?: string }): Promise<void> {
  await api.post(`/products/${slug}/reviews`, data);
}

export type { Product };