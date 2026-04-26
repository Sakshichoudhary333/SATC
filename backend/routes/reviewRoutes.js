import express from 'express';
import {
  addReview,
  getAllReviews,
  getDriverReviews,
  getDriverRating,
} from '../controllers/reviewController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ➤ Add Review (Customer)
router.post('/', authMiddleware, addReview);

// ➤ Get All Reviews (Admin)
router.get('/', authMiddleware, getAllReviews);

// ➤ Get Reviews for Driver
router.get('/driver/:driverId', getDriverReviews);

// ➤ Get Driver Rating
router.get('/rating/:driverId', getDriverRating);

export default router;