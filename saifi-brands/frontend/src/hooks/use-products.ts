"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductBySlug, searchProducts, createProduct, updateProduct, deleteProduct, adminGetProducts, adminGetProduct, type AdminProductQueryParams } from "@/services/products";
import { ProductQueryParams } from "@/types";

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

export function useAdminProducts(params?: AdminProductQueryParams) {
  return useQuery({
    queryKey: ["products", "admin", params],
    queryFn: () => adminGetProducts(params),
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ["product", "admin", id],
    queryFn: () => adminGetProduct(id),
    enabled: !!id,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductSearch(q: string) {
  return useQuery({
    queryKey: ["productSearch", q],
    queryFn: () => searchProducts(q),
    enabled: q.length >= 2,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parameters<typeof updateProduct>[1]> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
