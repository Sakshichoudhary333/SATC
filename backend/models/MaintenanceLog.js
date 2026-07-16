import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['Oil Change', 'Tire Rotation', 'Brake Inspection', 'Engine Checkup', 'General Repair'],
      required: true,
    },
    serviceDate: {
      type: Date,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'overdue'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Pre-save hook to automatically calculate overdue status
maintenanceLogSchema.pre('save', function (next) {
  if (this.status !== 'completed') {
    if (new Date() > new Date(this.nextDueDate)) {
      this.status = 'overdue';
    } else {
      this.status = 'scheduled';
    }
  }
  next();
});

export default mongoose.model('MaintenanceLog', maintenanceLogSchema);
