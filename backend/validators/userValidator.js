// validators/userValidator.js
import { body } from "express-validator";

export const validateUser = [
  // NAME
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters")
    .matches(/^[A-Za-z ]+$/).withMessage("Name must contain only letters"),

  // EMAIL
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),

  // PASSWORD
  body("password")
    .trim()
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain uppercase letter")
    .matches(/[a-z]/).withMessage("Must contain lowercase letter")
    .matches(/[0-9]/).withMessage("Must contain a number")
];