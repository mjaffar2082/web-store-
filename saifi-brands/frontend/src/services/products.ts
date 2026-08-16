import api from "./api";
import { Product, ProductQueryParams, PaginationMeta } from "@/types";

export interface ProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

export async function getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
  const response = await api.get("/products", { params });
  return response.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await api.get(`/products/${slug}`);
  return response.data.data;
}

export async function searchProducts(q: string): Promise<Product[]> {
  const response = await api.get("/products/search", { params: { q } });
  return response.data.data;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const response = await api.post("/products", data);
  return response.data.data;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const response = await api.patch(`/products/${id}`, data);
  return response.data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export interface AdminProductQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  isActive?: boolean;
}

export async function adminGetProducts(params?: AdminProductQueryParams): Promise<ProductsResponse> {
  const response = await api.get("/products/admin", {
    params: {
      page: params?.page,
      limit: params?.limit,
      q: params?.q || undefined,
      isActive: params?.isActive === undefined ? undefined : String(params.isActive),
    },
  });
  return response.data;
}

export async function adminGetProduct(id: string): Promise<Product> {
  const response = await api.get(`/products/admin/${id}`);
  return response.data.data;
}
