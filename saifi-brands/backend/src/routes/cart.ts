import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, cartController.getCart.bind(cartController));
router.post("/", authenticate, cartController.addItem.bind(cartController));
router.post("/clear", authenticate, cartController.clearCart.bind(cartController));
router.patch("/:id", authenticate, cartController.updateItem.bind(cartController));
router.delete("/:id", authenticate, cartController.removeItem.bind(cartController));

export default router;