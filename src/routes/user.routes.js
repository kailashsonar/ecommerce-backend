import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { addAddress, addressDelete, getUser, updateUserName } from "../controllers/user.controller.js";
import { addressDeleteSchema, addressSchema, updateUserNameSchema } from "../validations/user.validation.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/me", verifyJwt, getUser);
router.patch("/update-username", verifyJwt, validate(updateUserNameSchema), updateUserName);
router.post("/addresses", verifyJwt, validate(addressSchema), addAddress);
router.delete("/addresses/:id", verifyJwt, validate(addressDeleteSchema), addressDelete);

export default router;