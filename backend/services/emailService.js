import nodemailer from "nodemailer";

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

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw new Error("Email could not be sent");
  }
};