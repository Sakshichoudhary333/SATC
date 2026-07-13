import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ➤ Add Expense (Driver)
export const addExpense = async (req, res) => {
  try {
    const {
      trip,
      fuelCost,
      tollCost,
      foodCost,
      maintenanceCost,
      notes,
    } = req.body;

    if (!trip || !isValidObjectId(trip)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    // Block adding expenses to completed trips
    const tripDoc = await Trip.findById(trip);
    if (!tripDoc) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (tripDoc.status === 'completed') {
      // Allow exactly one post-trip expense submission per driver per trip
      const existing = await Expense.findOne({ trip, driver: req.user.id });
      if (existing) {
        return res.status(403).json({
          message: 'You have already submitted an expense for this completed trip',
        });
      }
    }

    const expense = await Expense.create({
      trip,
      driver: req.user.id,
      fuelCost: Number(fuelCost) || 0,
      tollCost: Number(tollCost) || 0,
      foodCost: Number(foodCost) || 0,
      maintenanceCost: Number(maintenanceCost) || 0,
      notes,
    });

    res.status(201).json({
      message: 'Expense added successfully',
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get All Expenses (Admin)
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('trip')
      .populate('driver', 'name email');

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get My Expenses (Driver)
export const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ driver: req.user.id })
      .populate({
        path: 'trip',
        populate: [
          { path: 'order' },
          { path: 'truck' },
          { path: 'driver', select: 'name email mobile' },
        ],
      })
      .populate('driver', 'name email mobile');

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get Expense Report (Total)
export const getExpenseReport = async (req, res) => {
  try {
    const expenses = await Expense.find();

    const total = expenses.reduce(
      (sum, exp) => sum + exp.totalExpense,
      0
    );

    res.json({
      totalExpenses: total,
      count: expenses.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Approve/Reject Expense (Admin)
export const updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid expense id' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    const expense = await Expense.findByIdAndUpdate(
      id,
      { approvalStatus: status },
      { new: true }
    ).populate('trip').populate('driver', 'name email');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({
      message: `Expense ${status} successfully`,
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Update Expense (Driver)
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fuelCost,
      tollCost,
      foodCost,
      maintenanceCost,
      notes,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid expense id' });
    }

    const expense = await Expense.findById(id).populate('trip');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if expense belongs to the user
    if (expense.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own expenses' });
    }

    // Check if expense is already approved
    if (expense.approvalStatus === 'approved') {
      return res.status(403).json({ message: 'Cannot edit approved expenses' });
    }

    // If trip is completed: allow exactly one post-trip edit, then lock
    if (expense.trip && expense.trip.status === 'completed') {
      if (expense.postTripEditUsed) {
        return res.status(403).json({
          message: 'Post-trip edit already used. Expense is now locked.',
        });
      }
      // Mark the post-trip edit as consumed
      expense.postTripEditUsed = true;
    }

    // Use save() so the pre('save') hook recalculates totalExpense
    expense.fuelCost = Number(fuelCost) || 0;
    expense.tollCost = Number(tollCost) || 0;
    expense.foodCost = Number(foodCost) || 0;
    expense.maintenanceCost = Number(maintenanceCost) || 0;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    // Re-populate after save for consistent response shape
    const updatedExpense = await Expense.findById(expense._id)
      .populate('trip')
      .populate('driver', 'name email');

    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Delete Expense (Driver)
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid expense id' });
    }

    const expense = await Expense.findById(id).populate('trip');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if expense belongs to the user
    if (expense.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own expenses' });
    }

    // Check if expense is already approved
    if (expense.approvalStatus === 'approved') {
      return res.status(403).json({ message: 'Cannot delete approved expenses' });
    }

    // Check if trip is completed
    if (expense.trip && expense.trip.status === 'completed') {
      return res.status(403).json({ message: 'Cannot delete expenses for completed trips' });
    }

    await Expense.findByIdAndDelete(id);

    res.json({
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
