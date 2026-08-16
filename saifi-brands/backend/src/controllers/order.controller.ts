import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { orderService } from "../services/order.service";
import { createOrderSchema, orderStatusSchema, orderQuerySchema } from "../validators/order.validator";

export class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(req.user!.userId, data);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = orderQuerySchema.parse(req.query);
      const result = await orderService.getOrders(req.user!.userId, query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.user!.userId, String(req.params.id));
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async listOrders(_req: Request, res: Response, next: NextFunction) {
    try {
      const query = orderQuerySchema.parse(_req.query);
      const result = await orderService.adminListOrders(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getOrder(_req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.adminGetOrder(String(_req.params.id));
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = orderStatusSchema.parse(_req.body);
      const order = await orderService.updateStatus(String(_req.params.id), data);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await orderService.dashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();