import api from "./api";
import { Brand } from "@/types";

export async function getBrands(): Promise<Brand[]> {
  const response = await api.get("/brands");
  return response.data.data;
}

export async function getBrandBySlug(slug: string): Promise<Brand> {
  const response = await api.get(`/brands/${slug}`);
  return response.data.data;
}

export async function createBrand(data: Partial<Brand>): Promise<Brand> {
  const response = await api.post("/brands", data);
  return response.data.data;
}

export async function updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
  const response = await api.patch(`/brands/${id}`, data);
  return response.data.data;
}

export async function deleteBrand(id: string): Promise<void> {
  await api.delete(`/brands/${id}`);
}
