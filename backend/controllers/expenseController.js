import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

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
