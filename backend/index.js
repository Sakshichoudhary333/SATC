import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

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
import billingRoutes from './routes/billingRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

import { initSocket } from './sockets/socket.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { requestLogger } from './middleware/requestLogger.js';
import { logger } from './utils/logger.js';
import { initTransporter } from './config/email.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingRequiredEnv = isProduction
  ? requiredEnv.filter((key) => !process.env[key])
  : [];

if (missingRequiredEnv.length) {
  throw new Error(`Missing required production environment variables: ${missingRequiredEnv.join(', ')}`);
}

connectDB();

// Initialize email transporter once at startup (non-blocking)
initTransporter().catch((err) =>
  logger.error('Email transporter init failed', { message: err.message })
);

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '1mb';
const globalLimiter = rateLimit({
  windowMs: Number(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.GLOBAL_RATE_LIMIT_MAX || (isProduction ? 300 : 2000)),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

app.set('trust proxy', 1);
app.disable('x-powered-by');

initSocket(server);

// ========================
// MIDDLEWARE
// ========================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel subdomain if Vercel is in allowedOrigins
    if (origin.endsWith('.vercel.app')) {
      const hasVercelWhitelisted = allowedOrigins.some(o => o.includes('vercel.app'));
      if (hasVercelWhitelisted) {
        return callback(null, true);
      }
    }
    logger.warn(`CORS blocked request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(globalLimiter);
app.use(express.json({ limit: jsonBodyLimit }));
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
app.use('/api/billing', billingRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// ========================
// TEST & FRONTEND ROUTES
// ========================
app.get('/healthz', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

if (isProduction) {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/healthz')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send('🚚 Truck Management System API Running');
  });
}

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
