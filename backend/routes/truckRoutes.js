import express from 'express';
import {
  addTruck,
  getTrucks,
  updateTruckLocation,
  getTruckETA,
} from '../controllers/truckController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, addTruck);
router.get('/', getTrucks);
router.put('/:id/location', authMiddleware, updateTruckLocation);
router.get('/:id/eta', authMiddleware, getTruckETA);

export default router;