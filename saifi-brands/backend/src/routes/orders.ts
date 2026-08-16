import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/admin", authenticate, authorize("ADMIN"), orderController.listOrders.bind(orderController));
router.get("/admin/dashboard", authenticate, authorize("ADMIN"), orderController.dashboard.bind(orderController));
router.get("/admin/:id", authenticate, authorize("ADMIN"), orderController.getOrder.bind(orderController));
router.patch("/admin/:id/status", authenticate, authorize("ADMIN"), orderController.updateStatus.bind(orderController));

router.get("/", authenticate, orderController.getMyOrders.bind(orderController));
router.get("/:id", authenticate, orderController.getMyOrder.bind(orderController));
router.post("/", authenticate, orderController.createOrder.bind(orderController));

export default router;