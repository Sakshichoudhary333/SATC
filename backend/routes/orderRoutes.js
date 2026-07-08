import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateCreateOrder, validateUpdateOrderStatus } from '../validators/orderValidator.js';

const router = express.Router();

router.post('/', authMiddleware, validateCreateOrder, createOrder);
router.get('/my', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, validateUpdateOrderStatus, updateOrderStatus);
router.get('/', authMiddleware, getAllOrders);

export default router;
