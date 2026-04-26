import express from "express";

import {
  getDashboard,
  getUsers,
  updateUser,
  updateTruck,
  updateOrder,
  deleteUser,
  deleteTruck,
  deleteOrder,
  createAdmin,
  approveOrder,
  rejectOrder,
  addDriver,
  updateDriver,
  assignTruck,
} from "../controllers/adminController.js";

import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ Dashboard
router.get("/dashboard", authMiddleware, isAdmin, getDashboard);

// ➤ Users / Drivers
router.get("/users", authMiddleware, isAdmin, getUsers);
router.post("/drivers", authMiddleware, isAdmin, addDriver);
router.put("/drivers/:id", authMiddleware, isAdmin, updateDriver);
router.put("/users/:id", authMiddleware, isAdmin, updateUser);
router.delete("/users/:id", authMiddleware, isAdmin, deleteUser);

// ➤ Assign Truck
router.post("/assign-truck", authMiddleware, isAdmin, assignTruck);

// ➤ Trucks
router.put("/trucks/:id", authMiddleware, isAdmin, updateTruck);
router.delete("/trucks/:id", authMiddleware, isAdmin, deleteTruck);

// ➤ Orders
router.put("/orders/:id", authMiddleware, isAdmin, updateOrder);
router.delete("/orders/:id", authMiddleware, isAdmin, deleteOrder);
router.put("/orders/:id/approve", authMiddleware, isAdmin, approveOrder);
router.put("/orders/:id/reject", authMiddleware, isAdmin, rejectOrder);

// ➤ Create Admin
router.post("/create-admin", authMiddleware, createAdmin);

export default router;
