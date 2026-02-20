import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { createContact } from "../controllers/contact.controller.js";
import { createContactSchema } from "../validations/contact.validation.js";

const router = Router();

router.post("/", validate(createContactSchema), createContact);

export default router;