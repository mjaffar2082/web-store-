"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyOrders,
  getOrderById,
  createOrder,
  adminGetOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  getDashboardStats,
  adminListUsers,
  adminToggleUserActive,
} from "@/services/orders";
import type { CreateOrderInput } from "@/services/orders";

export function useMyOrders(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["orders", "mine", params],
    queryFn: () => getMyOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useAdminOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["orders", "admin", params],
    queryFn: () => adminGetOrders(params),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["order", "admin", id],
    queryFn: () => adminGetOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminUpdateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats,
  });
}

export function useAdminUsers(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery({
    queryKey: ["users", "admin", params],
    queryFn: () => adminListUsers(params),
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminToggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}