import nodemailer from "nodemailer";
import { getTransporter } from "../config/email.js";

const sendEmail = async (to, subject, text) => {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER || "tms-dev@ethereal.email",
    to,
    subject,
    text,
  });

  // In dev, print clickable preview link — OTP is visible in the email body
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📧 Email sent to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Preview: ${previewUrl}\n`);
  }
};

export default sendEmail;
