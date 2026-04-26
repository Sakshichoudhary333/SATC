import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'choudharysakshi828@gmail.com',
    pass: 'obitxdmudjekekkl'
  }
});

transporter.verify((err, ok) => {
  if (err) {
    console.error('FAIL:', err.message);
    console.error('CODE:', err.responseCode);
    console.error('RESPONSE:', err.response);
  } else {
    console.log('OK - credentials valid');
  }
});
