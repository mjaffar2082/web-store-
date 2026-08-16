import api from "./api";
import { Order, ShippingAddress, PaginationMeta, User } from "@/types";

export interface OrdersResponse {
  data: Order[];
  meta: PaginationMeta;
}

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: "stripe" | "paypal" | "cod";
  email?: string;
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const response = await api.post("/orders", data);
  return response.data.data;
}

export async function getMyOrders(params?: { page?: number; limit?: number }): Promise<OrdersResponse> {
  const response = await api.get("/users/me/orders", { params });
  return response.data;
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await api.get(`/orders/${id}`);
  return response.data.data;
}

export interface PaymentIntentResult {
  mode: "mock" | "stripe";
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  amount: number;
}

export async function createPaymentIntent(orderId: string): Promise<PaymentIntentResult> {
  const response = await api.post("/payments/create-intent", { orderId });
  return response.data.data;
}

export async function verifyPayment(orderId: string): Promise<Order> {
  const response = await api.post("/payments/verify", { orderId });
  return response.data.data;
}

export async function adminGetOrders(params?: { page?: number; limit?: number; status?: string }): Promise<OrdersResponse> {
  const response = await api.get("/orders/admin", { params });
  return response.data;
}

export async function adminGetOrder(id: string): Promise<Order> {
  const response = await api.get(`/orders/admin/${id}`);
  return response.data.data;
}

export async function adminUpdateOrderStatus(id: string, status: string): Promise<Order> {
  const response = await api.patch(`/orders/admin/${id}/status`, { status });
  return response.data.data;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  recentOrders: Order[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get("/orders/admin/dashboard");
  return response.data.data;
}

export interface AdminUser extends User {
  isActive: boolean;
}

export async function adminListUsers(params?: { page?: number; limit?: number; q?: string }): Promise<{ data: AdminUser[]; meta: PaginationMeta }> {
  const response = await api.get("/users", { params });
  return response.data;
}

export async function adminToggleUserActive(id: string): Promise<AdminUser> {
  const response = await api.patch(`/users/${id}/toggle`);
  return response.data.data;
}