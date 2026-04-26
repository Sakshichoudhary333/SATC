

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js'; // or correct path



// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    // If user exists and is already verified, block re-registration
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // If user exists but not verified, remove the stale record so we can re-register
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ email });
    }

    // ✅ Allow only customer & driver
    const allowedRoles = ['customer', 'driver'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Only customer or driver can register',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: allowedRoles.includes(role) ? role : 'customer',
      isVerified: false,
      otp,
      otpExpiry,
    });

    // Send OTP email
    try {
      await sendEmail(
        email,
        'Email Verification OTP - TMS',
        `Hello ${name},\n\nYour verification OTP is: ${otp}\n\nIt is valid for 5 minutes.\n\n- Truck Management System`
      );
    } catch (emailErr) {
      console.error('❌ Email failed:', emailErr.message);
      // Still return success — user can use Resend OTP
      return res.status(201).json({
        message: 'Registered! OTP email failed to send — use Resend OTP on the verify page.',
        emailFailed: true,
      });
    }

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESEND OTP (for email verification)
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified)
      return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail(
      email,
      'Resend Email Verification OTP',
      `Your new verification OTP is: ${otp}. It is valid for 5 minutes.`
    );

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY OTP (email verification)
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpiry)
      return res.status(400).json({ message: 'No OTP requested' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: 'OTP expired' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res
        .status(401)
        .json({ message: 'Invalid credentials or email not verified' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // You can also set as httpOnly cookie if you prefer
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGOUT (stateless JWT: handled on client or with blacklist)
export const logout = async (req, res) => {
  // If using cookies:
  // res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
  // Or maintain a token blacklist in DB/Redis.
  res.status(200).json({ message: 'Logged out successfully' });
};

// FORGOT PASSWORD – send OTP for password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail(
      email,
      'Password Reset OTP',
      `Your password reset OTP is: ${otp}. It is valid for 5 minutes.`
    );

    res
      .status(200)
      .json({ message: 'Password reset OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESET PASSWORD – verify OTP and set new password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpiry)
      return res.status(400).json({ message: 'No OTP requested' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: 'OTP expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};