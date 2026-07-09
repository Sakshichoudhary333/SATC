import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

let _transporter = null;

// Call this once at server startup so the transporter is ready instantly
export const initTransporter = async () => {
  if (_transporter) return _transporter;

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    try {
      const account = await nodemailer.createTestAccount();
      _transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      });
      console.log("\n📬 Ethereal email ready");
      console.log("   Inbox: https://ethereal.email/messages\n");
    } catch {
      // Ethereal unavailable — fall through to null transporter (terminal-only OTP)
      console.warn("⚠️  Ethereal unavailable — OTP will only appear in terminal");
      _transporter = null;
    }
  } else {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return _transporter;
};

// Returns the cached transporter — never makes a network call
export const getTransporter = () => _transporter;

export default {
  sendMail: async (...args) => {
    if (!_transporter) throw new Error("Transporter not initialized");
    return _transporter.sendMail(...args);
  },
};
