// routes/userRoutes.js
import express from "express";
import bcrypt from "bcryptjs";

import { validateUser } from "../validators/userValidator.js";
import { handleValidationErrors } from "../middleware/handleErrors.js";

const router = express.Router();

router.post("/signup", validateUser, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Replace with MongoDB save
    const user = {
      name,
      email,
      password: hashedPassword
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;