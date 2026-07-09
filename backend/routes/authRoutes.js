import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOtp,
  validateResendOtp,
} from '../validators/userValidator.js';

const router = express.Router();

const isDev = process.env.NODE_ENV !== 'production';

// In development use very relaxed limits so testing isn't blocked.
// Tighten these before going to production.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 20,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 100 : 5,
  message: { message: 'Too many OTP requests, please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',       authLimiter, validateRegister,      register);
router.post('/verify-otp',     authLimiter, validateVerifyOtp,     verifyOtp);
router.post('/resend-otp',     otpLimiter,  validateResendOtp,     resendOtp);
router.post('/login',          authLimiter, validateLogin,         login);
router.post('/logout',         logout);
router.post('/forgot-password', otpLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword,  resetPassword);

export default router;
