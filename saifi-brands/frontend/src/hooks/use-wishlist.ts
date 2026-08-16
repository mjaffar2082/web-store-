"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWishlist,
  addToWishlist,
  removeWishlistItem,
  removeWishlistByProduct,
  addReview,
} from "@/services/wishlist";

export function useWishlist(enabled = true) {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeWishlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useRemoveWishlistByProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeWishlistByProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useAddReview() {
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: { rating: number; title?: string; comment?: string } }) =>
      addReview(slug, data),
  });
}