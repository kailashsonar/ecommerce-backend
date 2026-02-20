import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import { chengePasswordSchema, emailOnlySchema, loginSchema, otpSchema, registerSchema, resetPasswordSchema } from "../validations/auth.validation.js";
import { changePassword, forgotPassword, forgotPasswordResendOtp, login, logout, otpCheck, refreshJwtTokens, register, resendOtp, resetPassword } from "../controllers/auth.controller.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", verifyJwt, logout);
router.patch("/chenge-password", validate(chengePasswordSchema), verifyJwt, changePassword);
router.post("/otp-check", validate(otpSchema), otpCheck);
router.post("/resend-otp", validate(emailOnlySchema), resendOtp);
router.post("/forgot-password", validate(emailOnlySchema), forgotPassword);
router.post("/forgot-password-resend-otp", validate(emailOnlySchema), forgotPasswordResendOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/refresh-tokens", refreshJwtTokens);



export default router;