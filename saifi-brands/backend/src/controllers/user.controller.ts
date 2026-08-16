import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { userService } from "../services/user.service";
import {
  updateProfileSchema,
  updatePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators/user.validator";

export class UserController {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await userService.updateProfile(req.user!.userId, data);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updatePasswordSchema.parse(req.body);
      await userService.changePassword(req.user!.userId, data);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = Math.min(parseInt(req.query.limit as string || "20", 10), 100);
      const result = await userService.getOrders(req.user!.userId, page, limit);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await userService.getOrderById(req.user!.userId, String(req.params.id));
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await userService.getAddresses(req.user!.userId);
      res.json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  }

  async createAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createAddressSchema.parse(req.body);
      const address = await userService.createAddress(req.user!.userId, data);
      res.status(201).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  }

  async updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateAddressSchema.parse(req.body);
      const address = await userService.updateAddress(req.user!.userId, String(req.params.id), data);
      res.json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAddress(req.user!.userId, String(req.params.id));
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const req = _req as Request & { query: { page?: string; limit?: string; q?: string } };
      const page = parseInt(req.query.page || "1", 10);
      const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
      const result = await userService.listUsers(page, limit, req.query.q);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async toggleUserActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.toggleUserActive(req.user!.userId, String(req.params.id));
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();