import { body, param, query } from 'express-validator';
import { handleValidation } from './userValidator.js';

export const validateAddDriver = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters')
    .matches(/^[A-Za-z\s'-]+$/).withMessage('Name contains invalid characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 254 }).withMessage('Email too long')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 100 }).withMessage('Password must be 6–100 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),

  body('mobile')
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-()]{7,20}$/).withMessage('Invalid mobile number'),

  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('License number too long'),

  body('experience')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('Experience must be 0–60 years'),

  handleValidation,
];

export const validateUpdateDriver = [
  param('id').isMongoId().withMessage('Invalid driver id'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters')
    .matches(/^[A-Za-z\s'-]+$/).withMessage('Name contains invalid characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('mobile')
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-()]{7,20}$/).withMessage('Invalid mobile number'),

  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('License number too long'),

  body('experience')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('Experience must be 0–60 years'),

  body('driverStatus')
    .optional()
    .trim()
    .isIn(['active', 'inactive']).withMessage('Driver status must be active or inactive'),

  handleValidation,
];

export const validateAssignTruck = [
  body('driverId')
    .trim()
    .notEmpty().withMessage('Driver id is required')
    .isMongoId().withMessage('Invalid driver id'),

  body('truckId')
    .trim()
    .notEmpty().withMessage('Truck id is required')
    .isMongoId().withMessage('Invalid truck id'),

  handleValidation,
];

export const validateGetUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Limit must be 1–200'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),

  query('role')
    .optional()
    .trim()
    .isIn(['admin', 'customer', 'driver', 'all', '']).withMessage('Invalid role filter'),

  handleValidation,
];
