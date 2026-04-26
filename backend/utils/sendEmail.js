import transporter from "../config/email.js";

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: to, 
    subject: subject,
    text: text,
  });
};

export default sendEmail;