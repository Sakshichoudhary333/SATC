import OTP from "../models/otpModel.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import generateOTP from "../utils/generateOTP.js";

export const sendOTP = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  // Check user exists
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("User not found");
  }

  // Save OTP
  const savedOtp = await OTP.findOneAndUpdate(
    { email: normalizedEmail },
    {
      email: normalizedEmail,
      otp,
      createdAt: new Date(),
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  if (!savedOtp?._id) {
    throw new Error("Failed to save OTP");
  }

  // Save OTP in user document
  await User.findByIdAndUpdate(user._id, {
    $set: {
      otp,
      otpExpiry,
    },
  });

  // Send OTP Email
  await sendEmail(
    normalizedEmail,
    "OTP Verification",
    `Your OTP is ${otp}. It is valid for 5 minutes.`
  );

  // Show OTP only in development
  if (process.env.NODE_ENV !== "production") {
    console.log(`🔑 OTP for ${normalizedEmail}: ${otp}`);
  }

  return savedOtp;
};

export const verifyOTP = async (email, userOtp) => {
  const normalizedEmail = email.trim().toLowerCase();

  const record = await OTP.findOne({
    email: normalizedEmail,
  });

  if (!record) {
    return false;
  }

  const isMatch = record.otp === userOtp;

  if (isMatch) {
    await OTP.deleteOne({
      _id: record._id,
    });
  }

  return isMatch;
};