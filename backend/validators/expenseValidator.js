import { body } from 'express-validator';
import { handleValidation } from './userValidator.js';

export const validateAddExpense = [
  body('trip')
    .trim()
    .notEmpty().withMessage('Trip id is required')
    .isMongoId().withMessage('Invalid trip id'),

  body('fuelCost')
    .optional()
    .isFloat({ min: 0, max: 1_000_000 }).withMessage('Fuel cost must be a non-negative number'),

  body('tollCost')
    .optional()
    .isFloat({ min: 0, max: 1_000_000 }).withMessage('Toll cost must be a non-negative number'),

  body('foodCost')
    .optional()
    .isFloat({ min: 0, max: 1_000_000 }).withMessage('Food cost must be a non-negative number'),

  body('maintenanceCost')
    .optional()
    .isFloat({ min: 0, max: 1_000_000 }).withMessage('Maintenance cost must be a non-negative number'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be at most 500 characters'),

  handleValidation,
];
