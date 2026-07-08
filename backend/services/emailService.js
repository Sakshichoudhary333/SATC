import nodemailer from "nodemailer";
import { logger } from '../utils/logger.js';

/* ─────────────────────────────────────────
   CREATE TRANSPORTER
───────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ─────────────────────────────────────────
   GENERIC EMAIL FUNCTION
───────────────────────────────────────── */
export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: `"Truck Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent', { response: info.response, to, subject });
  } catch (error) {
    logger.error('Email failed', error);
    throw new Error("Email could not be sent");
  }
};
