  import express from 'express';
  import http from 'http';
  import dotenv from 'dotenv';
  import cors from 'cors';



  import connectDB from './config/db.js';

  // Routes
  import authRoutes from './routes/authRoutes.js';
  import orderRoutes from './routes/orderRoutes.js';
  import truckRoutes from './routes/truckRoutes.js';
  import tripRoutes from './routes/tripRoutes.js';
  import expenseRoutes from './routes/expenseRoutes.js';
  import reviewRoutes from './routes/reviewRoutes.js';
  import adminRoutes from './routes/adminRoutes.js';

  import otpRoutes from "./routes/otpRoutes.js";
  import transporter from "./config/email.js";

  // Socket
  import { initSocket } from './sockets/socket.js';

  // Middleware (error handling optional)
  import { errorMiddleware } from './middleware/errorMiddleware.js';

  import userRoutes from "./routes/userRoutes.js";
// 

import locationRoutes from "./routes/locationRoutes.js";


  dotenv.config();

  // 👇 ADD HERE
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

  // 🔥 Connect DB
  connectDB();

  const app = express();


  // 🔥 Create HTTP server for Socket.io
  const server = http.createServer(app);

  // 🔥 Socket.io init
  initSocket(server);

  // ========================
  // MIDDLEWARE
  // ========================
  app.use(cors());
  app.use(express.json());

  app.use("/api/users", userRoutes);

app.use("/api/location", locationRoutes);


  // ========================
  // API ROUTES
  // ========================
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/trucks', truckRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/otp',otpRoutes);

  // ========================
  // TEST ROUTE
  // ========================
  app.get('/', (req, res) => {
    res.send('🚚 Truck Management System API Running');
  });

  // ========================
  // ERROR HANDLER
  // ========================
  app.use(errorMiddleware);


  app.get("/test-email", async (req, res) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Test Email",
        text: "This is a test email",
      });

      console.log("✅ Test email sent:", info.response);
      res.send("Email sent successfully");
    } catch (err) {
      console.error("❌ Test email error:", err);
      res.send("Email failed");
    }
  });

  // ========================
  // START SERVER
  // ========================
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });