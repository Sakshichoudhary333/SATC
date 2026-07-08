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
import otpRoutes from './routes/otpRoutes.js';
import userRoutes from './routes/userRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import billingRoutes from './routes/billingRoutes.js';

import transporter from './config/email.js';
import { initSocket } from './sockets/socket.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { requestLogger } from './middleware/requestLogger.js';
import { logger } from './utils/logger.js';

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.disable('x-powered-by');

initSocket(server);

// ========================
// MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

// Sanitize req.body and req.params against NoSQL injection ($ and . operators)
app.use((_req, _res, next) => {
  const strip = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        strip(obj[key]);
      }
    }
  };
  strip(_req.body);
  strip(_req.params);
  next();
});

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
app.use('/api/otp', otpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/billing', billingRoutes);

// ========================
// TEST ROUTES
// ========================
app.get('/', (_req, res) => {
  res.send('🚚 Truck Management System API Running');
});

app.get('/test-email', async (_req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'This is a test email',
    });
    logger.info('Test email sent', { response: info.response });
    res.send('Email sent successfully');
  } catch (err) {
    logger.error('Test email failed', err);
    res.send('Email failed');
  }
});

// ========================
// ERROR HANDLER
// ========================
app.use(errorMiddleware);

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info('Server running', { port: PORT });
});
