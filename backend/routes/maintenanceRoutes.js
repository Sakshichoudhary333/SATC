import express from 'express';
import {
  createMaintenanceLog,
  getMaintenanceLogs,
  completeMaintenanceLog,
  deleteMaintenanceLog,
} from '../controllers/maintenanceController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createMaintenanceLog);
router.get('/', authMiddleware, isAdmin, getMaintenanceLogs);
router.put('/:id/complete', authMiddleware, isAdmin, completeMaintenanceLog);
router.delete('/:id', authMiddleware, isAdmin, deleteMaintenanceLog);

export default router;
