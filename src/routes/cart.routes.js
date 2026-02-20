import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { addToCart, clearCart, getCart, removeCartItem, updateCart } from "../controllers/cart.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { addToCartSchema, idValidationSchema, removeCartItemSchema, updateCartSchema } from "../validations/cart.validation.js";

const router = Router();

router.get("/", verifyJwt, getCart);
router.post("/items", verifyJwt, validate(addToCartSchema), addToCart);
router.patch("/items/:id", verifyJwt, validate(idValidationSchema), validate(updateCartSchema), updateCart);
router.delete("/items/:id", verifyJwt, validate(idValidationSchema), validate(removeCartItemSchema), removeCartItem);
router.delete("/", verifyJwt, clearCart);

export default router;