import mongoose from "mongoose";
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      // Node 22 + OpenSSL 3.6 compatibility fix for MongoDB Atlas TLS
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    });
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('Database connection failed', error);
    process.exit(1);
  }
};

export default connectDB;
