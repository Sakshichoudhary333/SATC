import express from 'express';
import {
  createTrip,
  updateTripStatus,
  getTrips,
} from '../controllers/tripController.js';

import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createTrip);
router.put('/:id/status', authMiddleware, updateTripStatus);
router.get('/', authMiddleware, getTrips);

export default router;
