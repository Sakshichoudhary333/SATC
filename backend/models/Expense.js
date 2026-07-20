import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fuelCost: {
      type: Number,
      default: 0,
    },
    tollCost: {
      type: Number,
      default: 0,
    },
    foodCost: {
      type: Number,
      default: 0,
    },
    maintenanceCost: {
      type: Number,
      default: 0,
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    postTripEditUsed: {
      type: Boolean,
      default: false,
    },
    receiptImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔥 Auto calculate total expense before saving
expenseSchema.pre('save', function () {
  this.totalExpense =
    Number(this.fuelCost || 0) +
    Number(this.tollCost || 0) +
    Number(this.foodCost || 0) +
    Number(this.maintenanceCost || 0);
});

export default mongoose.model('Expense', expenseSchema);
