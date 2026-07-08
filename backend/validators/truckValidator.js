import { body, param } from 'express-validator';
import { handleValidation } from './userValidator.js';

export const validateAddTruck = [
  body('truckNumber')
    .trim()
    .notEmpty().withMessage('Truck number is required')
    .isLength({ min: 2, max: 20 }).withMessage('Truck number must be 2–20 characters')
    .matches(/^[A-Za-z0-9\s\-]+$/).withMessage('Truck number contains invalid characters'),

  body('model')
    .optional()
    .trim()
    .isLength({ max: 60 }).withMessage('Model must be at most 60 characters'),

  body('capacity')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Capacity must be at most 30 characters'),

  body('status')
    .optional()
    .trim()
    .isIn(['available', 'maintenance']).withMessage('Status must be available or maintenance'),

  handleValidation,
];

export const validateUpdateLocation = [
  param('id').isMongoId().withMessage('Invalid truck id'),

  body('lat')
    .notEmpty().withMessage('lat is required')
    .isFloat({ min: -90, max: 90 }).withMessage('lat must be between -90 and 90'),

  body('lng')
    .notEmpty().withMessage('lng is required')
    .isFloat({ min: -180, max: 180 }).withMessage('lng must be between -180 and 180'),

  handleValidation,
];
