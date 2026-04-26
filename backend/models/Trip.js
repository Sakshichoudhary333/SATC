import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['started', 'in-transit', 'completed'],
      default: 'started',
    },
  },
  { timestamps: true }
);

// ⭐ IMPORTANT FIX
export default mongoose.model('Trip', tripSchema);