import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    mobile: { type: String },
    licenseNumber: { type: String },
    experience: { type: Number },
    driverStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
    role: { type: String, enum: ['admin', 'customer', 'driver'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);