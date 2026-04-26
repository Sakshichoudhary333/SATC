import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema(
  {
    truckNumber: { type: String, required: true },
    model: { type: String, default: '' },
    capacity: { type: String, default: '' },
    status: { type: String, enum: ['available', 'maintenance'], default: 'available' },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      lat: Number,
      lng: Number,
    },
    lastUpdated: {
      type: Date,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);



export default mongoose.model('Truck', truckSchema);
