import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes — matches otpService expiry
    },
  },
  { versionKey: false }
);

const OTP = mongoose.model("OTP", otpSchema, "otp");

export default OTP;
