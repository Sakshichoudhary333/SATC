import { body, param } from 'express-validator';
import { handleValidation } from './userValidator.js';

export const validateCreateOrder = [
  body('pickupLocation')
    .trim()
    .notEmpty().withMessage('Pickup location is required')
    .isLength({ min: 2, max: 200 }).withMessage('Pickup location must be 2–200 characters'),

  body('destination')
    .trim()
    .notEmpty().withMessage('Destination is required')
    .isLength({ min: 2, max: 200 }).withMessage('Destination must be 2–200 characters'),

  body('goodsDetails')
    .trim()
    .notEmpty().withMessage('Goods details are required')
    .isLength({ min: 3, max: 50 }).withMessage('Goods details must be 3–50 characters'),

  handleValidation,
];

export const validateUpdateOrderStatus = [
  param('id').isMongoId().withMessage('Invalid order id'),

  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'approved', 'rejected', 'assigned', 'in-transit', 'completed'])
    .withMessage('Invalid status value'),

  handleValidation,
];
