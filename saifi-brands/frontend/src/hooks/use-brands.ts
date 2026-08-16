"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand } from "@/services/brands";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
}

export function useBrand(slug: string) {
  return useQuery({
    queryKey: ["brand", slug],
    queryFn: () => getBrandBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateBrand>[1] }) =>
      updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
