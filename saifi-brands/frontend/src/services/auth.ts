import api from "./api";
import { User, Address, ShippingAddress } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(data: RegisterInput): Promise<AuthUser> {
  const response = await api.post("/auth/register", data);
  return response.data.data.user;
}

export async function login(data: LoginInput): Promise<AuthUser> {
  const response = await api.post("/auth/login", data);
  return response.data.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<User> {
  const response = await api.get("/auth/me");
  return response.data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post("/auth/reset-password", { token, password });
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await api.patch("/users/me", data);
  return response.data.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post("/users/me/password", { currentPassword, newPassword });
}

export async function getAddresses(): Promise<Address[]> {
  const response = await api.get("/users/me/addresses");
  return response.data.data;
}

export async function createAddress(data: ShippingAddress & { isDefault?: boolean }): Promise<Address> {
  const response = await api.post("/users/me/addresses", data);
  return response.data.data;
}

export async function updateAddress(id: string, data: Partial<ShippingAddress>): Promise<Address> {
  const response = await api.patch(`/users/me/addresses/${id}`, data);
  return response.data.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/users/me/addresses/${id}`);
}