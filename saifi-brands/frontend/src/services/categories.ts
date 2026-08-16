import api from "./api";
import { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get("/categories");
  return response.data.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await api.get(`/categories/${slug}`);
  return response.data.data;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await api.post("/categories", data);
  return response.data.data;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const response = await api.patch(`/categories/${id}`, data);
  return response.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
