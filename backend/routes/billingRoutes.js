import express from "express";
import {
  createBill,
  getBills,
  updateBill,
  deleteBill,
  generateMonthEndDriverPayouts
} from "../controllers/billingController.js";

const router = express.Router();

router.post("/create", createBill);
router.get("/all", getBills);
router.put("/pay/:id", updateBill);
router.delete("/delete/:id", deleteBill);
router.post("/driver-payouts/month-end", generateMonthEndDriverPayouts);

export default router;
