import express from "express";
import rateLimit from "express-rate-limit";
import {
  sendOtpController,
  verifyOtpController
} from "../controllers/otpController.js";
import { validateResendOtp, validateVerifyOtp } from "../validators/userValidator.js";

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests, please wait before trying again.' },
});

router.post("/send-otp", otpLimiter, validateResendOtp, sendOtpController);
router.post("/verify-otp", validateVerifyOtp, verifyOtpController);

export default router;