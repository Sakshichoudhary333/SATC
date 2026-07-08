import express from 'express';
import {
  addReview,
  getAllReviews,
  getDriverReviews,
  getDriverRating,
} from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateAddReview, validateDriverId } from '../validators/reviewValidator.js';

const router = express.Router();

// ➤ Add Review (Customer)
router.post('/', authMiddleware, validateAddReview, addReview);

// ➤ Get All Reviews (Admin)
router.get('/', authMiddleware, getAllReviews);

// ➤ Get Reviews for Driver
router.get('/driver/:driverId', validateDriverId, getDriverReviews);

// ➤ Get Driver Rating
router.get('/rating/:driverId', validateDriverId, getDriverRating);

export default router;