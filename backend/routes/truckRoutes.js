import express from 'express';
import {
  addTruck,
  getTrucks,
  getTruckById,
  getTruckActiveTrip,
  updateTruckLocation,
  getTruckETA,
} from '../controllers/truckController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateAddTruck, validateUpdateLocation } from '../validators/truckValidator.js';

const router = express.Router();

router.post('/', authMiddleware, validateAddTruck, addTruck);
router.get('/', getTrucks);
router.get('/:id', getTruckById);                               // public — shareable link
router.put('/:id/location', authMiddleware, validateUpdateLocation, updateTruckLocation);
router.get('/:id/eta', getTruckETA);                            // public — used by shareable page
router.get('/:id/trip', getTruckActiveTrip);                    // public — active trip for sharing

export default router;