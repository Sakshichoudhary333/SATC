import OTP from "../models/otpModel.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import generateOTP from "../utils/generateOTP.js";

export const sendOTP = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new Error("User not found");

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Persist OTP
  await OTP.findOneAndUpdate(
    { email: normalizedEmail },
    { email: normalizedEmail, otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  await User.findByIdAndUpdate(user._id, {
    $set: { otp, otpExpiry },
  });

  // Always print to terminal — instant, no network dependency
  console.log(`\n${"─".repeat(48)}`);
  console.log(`  🔑  OTP  : ${otp}`);
  console.log(`  📧  For  : ${normalizedEmail}`);
  console.log(`${"─".repeat(48)}\n`);

  // Send email in background — never blocks the API response
  sendEmail(
    normalizedEmail,
    "OTP Verification — TMS",
    `Your OTP is: ${otp}\n\nValid for 10 minutes.\n\n— TMS`
  ).catch((err) => console.warn("⚠️  Email failed (non-fatal):", err.message));
};

export const verifyOTP = async (email, userOtp) => {
  const normalizedEmail = email.trim().toLowerCase();

  const record = await OTP.findOne({ email: normalizedEmail });
  if (!record) return false;

  const isMatch = record.otp === String(userOtp).trim();
  if (isMatch) await OTP.deleteOne({ _id: record._id });

  return isMatch;
};
