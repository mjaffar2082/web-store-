import { Request } from "express";

export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
}

export interface ProductQuery extends PaginationQuery {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  inStock?: string;
  q?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  variantId?: string;
  variantName?: string;
  image?: string;
  price: number;
  quantity: number;
}