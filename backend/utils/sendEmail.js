import nodemailer from "nodemailer";
import { getTransporter } from "../config/email.js";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent");
    console.log(info);

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(preview);

  } catch (err) {
    console.error("EMAIL ERROR:");
    console.error(err);
    throw err;
  }
};

export default sendEmail;