import nodemailer from "nodemailer";
import { getTransporter } from "../config/email.js";

const sendEmail = async (to, subject, text, attachments = []) => {
  const transporter = getTransporter(); // synchronous — already initialized at startup
  if (!transporter) {
    console.warn("⚠️  No email transporter available — skipping email send");
    return;
  }

  const from = transporter.options?.auth?.user
    || process.env.EMAIL_USER
    || "noreply@tms.dev";

  try {
    const info = await transporter.sendMail({ from, to, subject, text, attachments });
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log(`📧 Preview: ${preview}`);
    }

    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

export default sendEmail;
