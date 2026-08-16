import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/webhook", paymentController.webhook.bind(paymentController));

router.post("/create-intent", authenticate, paymentController.createIntent.bind(paymentController));
router.post("/paypal", authenticate, paymentController.createPayPalOrder.bind(paymentController));
router.post("/verify", authenticate, paymentController.verify.bind(paymentController));

export default router;