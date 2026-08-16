import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/me", authenticate, userController.getMe.bind(userController));
router.patch("/me", authenticate, userController.updateMe.bind(userController));
router.post("/me/password", authenticate, userController.changePassword.bind(userController));
router.get("/me/orders", authenticate, userController.getMyOrders.bind(userController));
router.get("/me/orders/:id", authenticate, userController.getMyOrder.bind(userController));
router.get("/me/addresses", authenticate, userController.getAddresses.bind(userController));
router.post("/me/addresses", authenticate, userController.createAddress.bind(userController));
router.patch("/me/addresses/:id", authenticate, userController.updateAddress.bind(userController));
router.delete("/me/addresses/:id", authenticate, userController.deleteAddress.bind(userController));

router.get("/", authenticate, authorize("ADMIN"), userController.listUsers.bind(userController));
router.patch("/:id/toggle", authenticate, authorize("ADMIN"), userController.toggleUserActive.bind(userController));

export default router;