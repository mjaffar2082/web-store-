import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import { NotFoundError, AppError, UnauthorizedError } from "../utils/errors";
import {
  UpdateProfileInput,
  UpdatePasswordInput,
  CreateAddressInput,
  UpdateAddressInput,
} from "../validators/user.validator";

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...USER_SELECT,
        addresses: { orderBy: { isDefault: "desc" } },
      },
    });
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });
    return user;
  }

  async changePassword(userId: string, data: UpdatePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) throw new AppError("Current password is incorrect", 400);

    const password = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password, refreshToken: null },
    });
  }

  async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });
  }

  async createAddress(userId: string, data: CreateAddressInput) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.address.create({ data: { ...data, userId } });
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressInput) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundError("Address");

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.address.update({ where: { id: addressId }, data });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundError("Address");
    await prisma.address.delete({ where: { id: addressId } });
  }

  async getOrders(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        tax: Number(o.tax),
        shippingCost: Number(o.shippingCost),
        totalAmount: Number(o.totalAmount),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundError("Order");
    return {
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingCost: Number(order.shippingCost),
      totalAmount: Number(order.totalAmount),
    };
  }

  async listUsers(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const where = q
      ? {
          OR: [
            { email: { contains: q } },
            { firstName: { contains: q } },
            { lastName: { contains: q } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async toggleUserActive(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new AppError("You cannot deactivate your own account", 400);
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: USER_SELECT,
    });
  }

  async requireUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError("Account no longer exists");
    return user;
  }
}

export const userService = new UserService();