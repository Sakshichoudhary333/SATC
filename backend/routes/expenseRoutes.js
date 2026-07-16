import express from 'express';
import {
  addExpense,
  getAllExpenses,
  getMyExpenses,
  getExpenseReport,
  updateExpenseStatus,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { scanReceipt } from '../controllers/ocrController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateAddExpense } from '../validators/expenseValidator.js';

const router = express.Router();

// ➤ OCR Scan Receipt (Driver)
router.post('/ocr', authMiddleware, scanReceipt);

// ➤ Add Expense (Driver)
router.post('/', authMiddleware, validateAddExpense, addExpense);

// ➤ Get My Expenses (Driver)
router.get('/my', authMiddleware, getMyExpenses);

// ➤ Get All Expenses (Admin)
router.get('/', authMiddleware, getAllExpenses);

// ➤ Expense Report (Admin)
router.get('/report', authMiddleware, getExpenseReport);

// ➤ Approve/Reject Expense (Admin)
router.put('/:id/status', authMiddleware, updateExpenseStatus);

// ➤ Update Expense (Driver)
router.put('/:id', authMiddleware, updateExpense);

// ➤ Delete Expense (Driver)
router.delete('/:id', authMiddleware, deleteExpense);

export default router;