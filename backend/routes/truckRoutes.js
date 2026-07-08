import express from 'express';
import {
  addTruck,
  getTrucks,
  updateTruckLocation,
  getTruckETA,
} from '../controllers/truckController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateAddTruck, validateUpdateLocation } from '../validators/truckValidator.js';

const router = express.Router();

router.post('/', authMiddleware, validateAddTruck, addTruck);
router.get('/', getTrucks);
router.put('/:id/location', authMiddleware, validateUpdateLocation, updateTruckLocation);
router.get('/:id/eta', authMiddleware, getTruckETA);

export default router;