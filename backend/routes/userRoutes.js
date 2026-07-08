import express from 'express';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateUser } from '../validators/userValidator.js';
import { handleValidationErrors } from '../middleware/handleErrors.js';

const router = express.Router();

router.post('/signup', validateUser, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -otp -otpExpiry -loginOtp -loginOtpExpiry'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -otp -otpExpiry -loginOtp -loginOtpExpiry'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
