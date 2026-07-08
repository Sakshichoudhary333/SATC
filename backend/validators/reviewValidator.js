import { body, param } from 'express-validator';
import { handleValidation } from './userValidator.js';

export const validateAddReview = [
  body('order')
    .trim()
    .notEmpty().withMessage('Order id is required')
    .isMongoId().withMessage('Invalid order id'),

  body('driver')
    .optional()
    .trim()
    .isMongoId().withMessage('Invalid driver id'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Feedback must be at most 1000 characters'),

  handleValidation,
];

export const validateDriverId = [
  param('driverId').isMongoId().withMessage('Invalid driver id'),
  handleValidation,
];
