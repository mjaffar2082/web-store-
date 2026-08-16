export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  specifications?: Record<string, string>;
  basePrice: number;
  discountPrice?: number;
  discountStart?: string;
  discountEnd?: string;
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDesc?: string;
  categoryId?: string;
  category?: { name: string; slug: string };
  brandId?: string;
  brand?: { name: string; slug: string; logo?: string };
  images: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: string;
  sku: string;
  price?: number;
  stock: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  userId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  products?: Product[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  products?: Product[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: string;
  q?: string;
}

export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
  isDefault: boolean;
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

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  variantId?: string | null;
  variant?: ProductVariant | null;
  name: string;
  slug: string;
  sku: string;
  image?: string | null;
  price: number;
  unitPrice: number;
  stock: number;
  available: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  variantId?: string | null;
  variantName?: string | null;
  image?: string | null;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  shippingAddress: ShippingAddress;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
  user?: { id: string; email: string; firstName?: string | null; lastName?: string | null };
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  provider?: string | null;
  reference?: string | null;
  status: string;
  amount: number;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  createdAt: string;
  product: Product;
}
