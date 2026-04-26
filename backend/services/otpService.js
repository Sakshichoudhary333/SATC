// services/otpService.js
import OTP from "../models/otpModel.js";
import transporter from "../utils/sendEmail.js";

import bcrypt from "bcryptjs";
import generateOTP from "../utils/generateOTP.js"; // 👈 you forgot this too

export const sendOTP = async (email) => {


  console.log("🔥 sendOTP CALLED for:", email); // 👈 ADD THIS

  console.log("Generated OTP:", otp); // 👈 ADD THIS
  const otp = generateOTP();

  const hashedOtp = await bcrypt.hash(otp, 10);

  await OTP.deleteMany({ email });

  await OTP.create({ email, otp: hashedOtp });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`,
  });
};

export const verifyOTP = async (email, userOtp) => {
  const record = await OTP.findOne({ email });

  if (!record) return false;

  const isMatch = await bcrypt.compare(userOtp, record.otp);

  return isMatch;
};