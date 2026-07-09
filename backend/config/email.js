import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

let _transporter = null;

export const getTransporter = async () => {
  if (_transporter) return _transporter;

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const account = await nodemailer.createTestAccount();
    console.log("\n📬 Dev email account created (Ethereal)");
    console.log("   User :", account.user);
    console.log("   Pass :", account.pass);
    console.log("   Inbox: https://ethereal.email/messages\n");

    _transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: account.user, pass: account.pass },
    });
  } else {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    try {
      await _transporter.verify();
      console.log("✅ SMTP Connected Successfully");
    } catch (err) {
      console.error("❌ SMTP Connection Failed:", err);
    }

  

  return _transporter;
};

// Synchronous default export for files that import it directly
// (will be null on first import — use getTransporter() for async)
export default { sendMail: async (...args) => (await getTransporter()).sendMail(...args) };
