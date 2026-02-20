import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { cancelOrder, createOrder, getMyOrders, getOrder } from "../controllers/order.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { createOrderSchema, getOrdersSchema, idValidationSchema } from "../validations/order.validation.js";

const router = Router();

router.post("/", verifyJwt, validate(createOrderSchema), createOrder);
router.get("/my", verifyJwt, validate(getOrdersSchema), getMyOrders);
router.get("/:id", verifyJwt, validate(idValidationSchema), getOrder);
router.patch("/:id/cancel", verifyJwt, validate(idValidationSchema), cancelOrder);



export default router;