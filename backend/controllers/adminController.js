import mongoose from 'mongoose';
import User from "../models/User.js";
import Truck from "../models/Truck.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


// ➤ Dashboard Stats
export const getDashboard = async (req, res) => {
  try {
    const totalTrucks = await Truck.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const availableTrucks = await Truck.countDocuments({ isAvailable: true });
    const assignedTrucks = await Truck.countDocuments({ isAvailable: false });
    const totalOrders = await Order.countDocuments();

    res.json({ totalTrucks, totalDrivers, availableTrucks, assignedTrucks, totalOrders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard", error: error.message });
  }
};


// ➤ Get Users (Search + Pagination)
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", role = "" } = req.query;
    const pageNum = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(Number.parseInt(limit, 10) || 50, 1);

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    if (role && role !== "all") {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({ total, page: pageNum, pages: Math.ceil(total / limitNum), users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};


// ➤ Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      fullName,
      email,
      role,
      mobile,
      licenseNumber,
      experience,
      driverStatus,
    } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from removing their own role
    const nextRole = typeof role === "string" ? role.toLowerCase() : role;
    if (req.user.id === id && nextRole && nextRole !== "admin") {
      return res.status(400).json({
        message: "You cannot remove your own admin role",
      });
    }

    const nextName = name ?? fullName;
    user.name = nextName ?? user.name;
    user.email = email ?? user.email;
    user.role = nextRole ?? user.role;
    user.mobile = mobile ?? user.mobile;
    user.licenseNumber = licenseNumber ?? user.licenseNumber;
    user.experience = experience ?? user.experience;
    user.driverStatus = driverStatus ?? user.driverStatus;

    const updatedUser = await user.save();

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};


// ➤ Update Truck
export const updateTruck = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid truck id" });
    }

    const truck = await Truck.findById(id);

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    Object.assign(truck, req.body);

    const updatedTruck = await truck.save();

    res.json({
      message: "Truck updated successfully",
      truck: updatedTruck,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating truck",
      error: error.message,
    });
  }
};


// ➤ Update Order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { pickupLocation, destination, goodsDetails } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (pickupLocation !== undefined) order.pickupLocation = pickupLocation;
    if (destination !== undefined) order.destination = destination;
    if (goodsDetails !== undefined) order.goodsDetails = goodsDetails;

    const updatedOrder = await order.save();

    res.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order",
      error: error.message,
    });
  }
};


// ➤ Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};


// ➤ Delete Truck
export const deleteTruck = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid truck id" });
    }

    const truck = await Truck.findById(id);

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    await truck.deleteOne();

    res.json({ message: "Truck deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting truck",
      error: error.message,
    });
  }
};


// ➤ Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting order",
      error: error.message,
    });
  }
};

// ➤ Approve Order
export const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'approved';
    await order.save();

    const populated = await order.populate([
      { path: 'driver', select: 'name mobile email licenseNumber' },
      { path: 'truck', select: 'truckNumber model capacity location lastUpdated isAvailable' },
    ]);

    res.json({ message: 'Order approved', order: populated });
  } catch (error) {
    res.status(500).json({ message: 'Error approving order', error: error.message });
  }
};

// ➤ Reject Order
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'rejected';
    await order.save();

    res.json({ message: 'Order rejected', order });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting order', error: error.message });
  }
};

// ➤ Assign Truck to Driver
export const assignTruck = async (req, res) => {
  try {
    const { driverId, truckId } = req.body;

    if (!driverId || !truckId) {
      return res.status(400).json({ message: "driverId and truckId are required" });
    }

    if (!isValidObjectId(driverId) || !isValidObjectId(truckId)) {
      return res.status(400).json({ message: "driverId and truckId must be valid ObjectIds" });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    const existingTruck = await Truck.findOne({ driver: driverId });
    if (existingTruck) {
      return res.status(400).json({
        message: `Driver already has truck ${existingTruck.truckNumber}. Unassign it first before assigning another truck.`,
      });
    }

    const truck = await Truck.findById(truckId);
    if (!truck) return res.status(404).json({ message: "Truck not found" });

    if (truck.driver) {
      return res.status(400).json({
        message: `Truck ${truck.truckNumber} is already assigned to a driver.`,
      });
    }

    if (!truck.isAvailable) {
      return res.status(400).json({
        message: `Truck ${truck.truckNumber} is not available for assignment.`,
      });
    }

    truck.driver = driverId;
    truck.isAvailable = false;
    await truck.save();

    const populated = await truck.populate('driver', 'name email');
    res.json({ message: "Truck assigned successfully", truck: populated });
  } catch (error) {
    res.status(500).json({ message: "Error assigning truck", error: error.message });
  }
};

// ➤ Add Driver (Admin creates a driver account directly)
export const addDriver = async (req, res) => {
  try {
    const { name, email, mobile, licenseNumber, experience, driverStatus } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({ message: "Name, email and mobile are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const defaultPassword = `Driver@${mobile}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const driver = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobile,
      licenseNumber,
      experience: experience ? Number(experience) : undefined,
      driverStatus: driverStatus || 'active',
      role: "driver",
      isVerified: true,
    });

    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (error) {
    res.status(500).json({ message: "Error adding driver", error: error.message });
  }
};

// ➤ Update Driver
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, licenseNumber, experience, driverStatus } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid driver id" });
    }

    const driver = await User.findById(id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    if (name) driver.name = name;
    if (mobile) driver.mobile = mobile;
    if (licenseNumber !== undefined) driver.licenseNumber = licenseNumber;
    if (experience !== undefined) driver.experience = Number(experience);
    if (driverStatus) driver.driverStatus = driverStatus;

    const updated = await driver.save();
    res.json({ message: "Driver updated", driver: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating driver", error: error.message });
  }
};

// ➤ Create Admin
export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating admin",
      error: error.message,
    });
  }
};
