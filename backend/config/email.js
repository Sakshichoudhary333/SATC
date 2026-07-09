import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

let _transporter = null;

export const initTransporter = async () => {
  if (_transporter) return _transporter;

  const isDev = process.env.NODE_ENV !== "production";

  // Prefer Gmail if credentials are available (both dev and production)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("\n📬 Gmail email ready\n");
  } else if (isDev) {
    // Fallback to Ethereal only in dev if no Gmail credentials
    try {
      const account = await nodemailer.createTestAccount();
      _transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 465,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      });
      console.log("\n📬 Ethereal email ready");
      console.log("   Inbox: https://ethereal.email/messages\n");
    } catch {
      console.warn("⚠️  No email credentials available — OTP will only appear in terminal");
      _transporter = null;
    }
  } else {
    console.warn("⚠️  No email credentials available — OTP will only appear in terminal");
    _transporter = null;
  }

  return _transporter;
};

export const getTransporter = () => _transporter;

export default {
  sendMail: async (...args) => {
    if (!_transporter) throw new Error("Transporter not initialized");
    return _transporter.sendMail(...args);
  },
};
