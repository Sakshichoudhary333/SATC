import { sendOTP, verifyOTP } from "../services/otpService.js";

export const sendOtpController = async (req, res) => {
  const { email } = req.body;

  await sendOTP(email);
  res.json({ message: "OTP sent successfully" });
};

export const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;

  const valid = await verifyOTP(email, otp);

  if (valid) {
    res.json({ message: "OTP Verified ✅" });
  } else {
    res.status(400).json({ message: "Invalid or Expired OTP ❌" });
  }
};