import express from 'express';
import {
  createTrip,
  updateTripStatus,
  getTrips,
  updateTrip,
  cancelTrip,
} from '../controllers/tripController.js';

import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createTrip);
router.get('/', authMiddleware, getTrips);
router.put('/:id/status', authMiddleware, updateTripStatus);
router.put('/:id', authMiddleware, isAdmin, updateTrip);
router.delete('/:id', authMiddleware, isAdmin, cancelTrip);

export default router;
