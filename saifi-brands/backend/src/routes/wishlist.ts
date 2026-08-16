import { Router } from "express";
import { wishlistController } from "../controllers/wishlist.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, wishlistController.getWishlist.bind(wishlistController));
router.post("/", authenticate, wishlistController.addItem.bind(wishlistController));
router.delete("/product/:productId", authenticate, wishlistController.removeByProduct.bind(wishlistController));
router.delete("/:id", authenticate, wishlistController.removeItem.bind(wishlistController));

export default router;