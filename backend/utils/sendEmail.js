import nodemailer from "nodemailer";
import { getTransporter } from "../config/email.js";

const sendEmail = async (to, subject, text) => {
  const transporter = getTransporter(); // synchronous — already initialized at startup
  if (!transporter) {
    console.warn("⚠️  No email transporter available — skipping email send");
    return;
  }

  const from = transporter.options?.auth?.user
    || process.env.EMAIL_USER
    || "noreply@tms.dev";

  const info = await transporter.sendMail({ from, to, subject, text });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log(`📧 Preview: ${preview}`);
  }

  return info;
};

export default sendEmail;
