import mongoose from "mongoose";
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  try {
    const isSrv = process.env.MONGO_URI && process.env.MONGO_URI.startsWith('mongodb+srv');
    const options = {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    if (isSrv || process.env.MONGO_TLS === 'true') {
      options.tls = true;
      options.tlsAllowInvalidCertificates = process.env.MONGO_TLS_ALLOW_INVALID_CERTS === 'true';
      options.tlsAllowInvalidHostnames = process.env.MONGO_TLS_ALLOW_INVALID_HOSTNAMES === 'true';
    }

    await mongoose.connect(process.env.MONGO_URI, options);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('Database connection failed', error);
    process.exit(1);
  }
};

export default connectDB;
