import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { paymentService } from "../services/payment.service";
import { orderService } from "../services/order.service";

export class PaymentController {
  async createIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.user!.userId, String(req.body.orderId));
      const result = await paymentService.createPaymentIntent(order as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createPayPalOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.user!.userId, String(req.body.orderId));
      const result = await paymentService.createPayPalOrder(order as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await paymentService.verifyPayment(String(req.body.orderId), req.user!.userId);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = (req as any).rawBody;
      const signature = req.headers["stripe-signature"] as string | undefined;
      const result = await paymentService.handleWebhook(raw ?? req.body, signature);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();