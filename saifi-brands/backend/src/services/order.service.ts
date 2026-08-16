import prisma from "../utils/prisma";
import { AppError, NotFoundError } from "../utils/errors";
import { CreateOrderInput, OrderStatusInput, OrderQueryInput } from "../validators/order.validator";
import { config } from "../config";
import { OrderItem } from "../types";
import { sendEmail, orderConfirmationEmail } from "./email.service";
import { Prisma } from "@prisma/client";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SB-${ts}-${rand}`;
}

function money(value: unknown): number {
  return Number(value);
}

export class OrderService {
  async createOrder(userId: string, data: CreateOrderInput) {
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: true,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.productId} is unavailable`, 400);
      }

      let variant = null;
      if (item.variantId) {
        variant = product.variants.find((v) => v.id === item.variantId && v.isActive);
        if (!variant) throw new AppError("Selected variant is unavailable", 400);
        if (variant.stock < item.quantity) {
          throw new AppError(`Only ${variant.stock} of "${variant.name}" left in stock`, 400);
        }
      } else if (product.stock < item.quantity) {
        throw new AppError(`Only ${product.stock} of "${product.name}" left in stock`, 400);
      }

      const unitPrice = variant ? money(variant.price ?? 0) : money(product.discountPrice ?? product.basePrice);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: variant?.sku ?? product.sku,
        variantId: variant?.id ?? undefined,
        variantName: variant?.name ?? undefined,
        image: product.images[0]?.url ?? undefined,
        price: unitPrice,
        quantity: item.quantity,
      });
    }

    const shippingCost = subtotal >= config.freeShippingThreshold ? 0 : config.flatShippingCost;
    const tax = Math.round(subtotal * config.taxRate);
    const totalAmount = subtotal + tax + shippingCost;

    const orderNumber = generateOrderNumber();
    const email = data.email || null;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant || variant.stock < item.quantity) {
            throw new AppError(`Insufficient stock for "${item.name}"`, 400);
          }
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) {
            throw new AppError(`Insufficient stock for "${item.name}"`, 400);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          items: orderItems as unknown as Prisma.InputJsonValue,
          subtotal,
          tax,
          shippingCost,
          totalAmount,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: data.paymentMethod,
          shippingAddress: data.shippingAddress as unknown as Prisma.InputJsonValue,
          email,
        },
      });

      await tx.payment.create({
        data: {
          orderId: created.id,
          method: data.paymentMethod,
          status: "PENDING",
          amount: totalAmount,
          metadata: { items: orderItems.length },
        },
      });

      return created;
    });

    await prisma.cartItem.deleteMany({
      where: {
        cart: { userId },
        OR: orderItems.map((i) => ({ productId: i.productId, variantId: i.variantId ?? null })),
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const recipient = email || user?.email;
    if (recipient) {
      const { subject, html } = orderConfirmationEmail(orderNumber, totalAmount);
      await sendEmail({ to: recipient, subject, html });
    }

    return {
      ...order,
      subtotal: money(order.subtotal),
      tax: money(order.tax),
      shippingCost: money(order.shippingCost),
      totalAmount: money(order.totalAmount),
    };
  }

  async getOrders(userId: string, query: OrderQueryInput) {
    const page = parseInt(query.page, 10);
    const limit = Math.min(parseInt(query.limit, 10), 100);
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => ({
        ...o,
        subtotal: money(o.subtotal),
        tax: money(o.tax),
        shippingCost: money(o.shippingCost),
        totalAmount: money(o.totalAmount),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payments: { orderBy: { createdAt: "desc" } } },
    });
    if (!order) throw new NotFoundError("Order");
    return {
      ...order,
      subtotal: money(order.subtotal),
      tax: money(order.tax),
      shippingCost: money(order.shippingCost),
      totalAmount: money(order.totalAmount),
      payments: order.payments.map((p) => ({ ...p, amount: money(p.amount) })),
    };
  }

  async adminListOrders(query: OrderQueryInput) {
    const page = parseInt(query.page, 10);
    const limit = Math.min(parseInt(query.limit, 10), 100);
    const skip = (page - 1) * limit;

    const where = query.status ? { status: query.status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => ({
        ...o,
        subtotal: money(o.subtotal),
        tax: money(o.tax),
        shippingCost: money(o.shippingCost),
        totalAmount: money(o.totalAmount),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminGetOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!order) throw new NotFoundError("Order");
    return {
      ...order,
      subtotal: money(order.subtotal),
      tax: money(order.tax),
      shippingCost: money(order.shippingCost),
      totalAmount: money(order.totalAmount),
      payments: order.payments.map((p) => ({ ...p, amount: money(p.amount) })),
    };
  }

  async updateStatus(orderId: string, data: OrderStatusInput) {
    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new NotFoundError("Order");

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: data.status },
    });

    return {
      ...order,
      subtotal: money(order.subtotal),
      tax: money(order.tax),
      shippingCost: money(order.shippingCost),
      totalAmount: money(order.totalAmount),
    };
  }

  async dashboardStats() {
    const [totalOrders, totalRevenue, pendingOrders, totalCustomers, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { totalAmount: true } }),
        prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { user: { select: { email: true, firstName: true, lastName: true } } },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: money(totalRevenue._sum.totalAmount ?? 0),
      pendingOrders,
      totalCustomers,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        subtotal: money(o.subtotal),
        tax: money(o.tax),
        shippingCost: money(o.shippingCost),
        totalAmount: money(o.totalAmount),
      })),
    };
  }
}

export const orderService = new OrderService();