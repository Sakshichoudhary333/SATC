import express from "express";
import {
  createBill,
  getBills,
  updateBill,
  deleteBill,
  generateMonthEndDriverPayouts,
  downloadInvoice
} from "../controllers/billingController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, isAdmin, createBill);
router.get("/all", authMiddleware, isAdmin, getBills);
router.put("/pay/:id", authMiddleware, isAdmin, updateBill);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteBill);
router.post("/driver-payouts/month-end", authMiddleware, isAdmin, generateMonthEndDriverPayouts);
router.get("/:id/invoice", authMiddleware, downloadInvoice);

export default router;
