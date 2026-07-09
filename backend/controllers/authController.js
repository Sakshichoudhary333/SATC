import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateOTP from '../utils/generateOTP.js';
import { generateToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import { logger } from '../utils/logger.js';

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Always work with lowercase email
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Stale unverified record — remove so we can re-register
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ email: normalizedEmail });
    }

    const allowedRoles = ['customer', 'driver'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Only customer or driver can register' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: allowedRoles.includes(role) ? role : 'customer',
      isVerified: false,
    });

    try {
      await sendOTP(normalizedEmail);
    } catch (emailErr) {
      // OTP is already logged to terminal — email failure doesn't block registration
      logger.error('OTP send failed during registration', { message: emailErr.message });
      return res.status(201).json({
        message: 'Registered! Check the server terminal for your OTP (email failed to send).',
        emailFailed: true,
      });
    }

    return res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    logger.error('Register error', err);
    return res.status(500).json({ message: err.message });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    await sendOTP(normalizedEmail);
    return res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    const { otp } = req.body;

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await verifyOTP(normalizedEmail, otp);
    if (!valid) return res.status(400).json({ message: 'Invalid or Expired OTP' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isVerified) {
      return res.status(401).json({ message: 'Invalid credentials or email not verified' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      name: user.name || '',
      email: normalizedEmail,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (_req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Always print to terminal — instant, no network dependency
    console.log(`\n${'─'.repeat(48)}`);
    console.log(`  🔑  Password Reset OTP : ${otp}`);
    console.log(`  📧  For               : ${normalizedEmail}`);
    console.log(`${'─'.repeat(48)}\n`);

    // Respond immediately — don't wait for email
    res.status(200).json({ message: 'Password reset OTP sent to your email' });

    // Send email in background (non-blocking)
    sendEmail(
      normalizedEmail,
      'Password Reset OTP — TMS',
      `Your password reset OTP is: ${otp}\n\nValid for 10 minutes.\n\n— TMS`
    ).catch((err) => console.warn('⚠️  Reset OTP email failed:', err.message));

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    const { otp, newPassword } = req.body;

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpiry)
      return res.status(400).json({ message: 'No OTP requested' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: 'OTP expired' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
